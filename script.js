const SUPABASE_URL = 'https://vvdvnlfaqjmtivocxmbu.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Ye4vFPVmdCQJI1IgEFZX6Q_1rTl59QA';

// تهيئة Supabase - تجنب التصريح المزدوج
let supabaseClient = null;
if (typeof window !== 'undefined' && window.supabase) {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

const cacheSystem = {
    data: {},
    timestamps: {},
    cacheDuration: 5 * 60 * 1000, // 5 دقائق

    set(key, value) {
        this.data[key] = value;
        this.timestamps[key] = Date.now();
    },

    get(key) {
        if (!this.data[key]) return null;
        const age = Date.now() - this.timestamps[key];
        if (age > this.cacheDuration) {
            delete this.data[key];
            delete this.timestamps[key];
            return null;
        }
        return this.data[key];
    },

    clear(key) {
        delete this.data[key];
        delete this.timestamps[key];
    },

    clearAll() {
        this.data = {};
        this.timestamps = {};
    }
};

/* ========================================
   REQUEST BATCHING - تجميع الطلبات
   ======================================== */

const requestBatcher = {
    queue: [],
    timer: null,
    delay: 100, // تأخير 100ms لتجميع الطلبات

    add(fn) {
        return new Promise((resolve, reject) => {
            this.queue.push({ fn, resolve, reject });
            this.schedule();
        });
    },

    schedule() {
        if (this.timer) return;
        this.timer = setTimeout(() => this.flush(), this.delay);
    },

    async flush() {
        if (this.queue.length === 0) {
            this.timer = null;
            return;
        }

        const batch = this.queue.splice(0);
        this.timer = null;

        try {
            const results = await Promise.all(batch.map(item => item.fn()));
            batch.forEach((item, i) => item.resolve(results[i]));
        } catch (error) {
            batch.forEach(item => item.reject(error));
        }
    }
};

/* ========================================
   UTILITY FUNCTIONS
   ======================================== */

/**
 * عرض إشعار Toast
 */
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.textContent = message;
    toast.className = `toast show ${type}`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}

/**
 * التحقق من البريد الإلكتروني
 */
function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * التحقق من قوة كلمة المرور
 */
function isStrongPassword(password) {
    return password.length >= 8;
}

/**
 * التحقق من صحة النطاق الفرعي
 */
function isValidSubdomain(subdomain) {
    const regex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/i;
    return regex.test(subdomain) && subdomain.length > 0 && subdomain.length <= 63;
}

/**
 * الحصول على المستخدم الحالي (مع caching)
 */
async function getCurrentUser() {
    if (!supabase) return null;

    const cached = cacheSystem.get('currentUser');
    if (cached) return cached;

    try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
            console.error('خطأ في جلب الجلسة:', error);
            return null;
        }

        const user = session?.user || null;

        if (user) {
            cacheSystem.set('currentUser', user);
        }

        return user;
    } catch (error) {
        console.error('خطأ في getCurrentUser:', error);
        return null;
    }
}

/**
 * إعادة توجيه المستخدم إلى صفحة تسجيل الدخول إذا لم يكن مسجلاً
 */
async function checkAuth() {
    const user = await getCurrentUser();
    if (!user && window.location.pathname.includes('dashboard')) {
        window.location.href = 'auth.html';
    }
    return user;
}

/* ========================================
   NAVBAR MOBILE MENU
   ======================================== */

const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const navbarMenu = document.getElementById('navbarMenu');

if (mobileMenuToggle && navbarMenu) {
    mobileMenuToggle.addEventListener('click', () => {
        navbarMenu.classList.toggle('active');
        mobileMenuToggle.classList.toggle('active');
    });

    navbarMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navbarMenu.classList.remove('active');
            mobileMenuToggle.classList.remove('active');
        });
    });
}

/* ========================================
   AUTHENTICATION PAGE
   ======================================== */

const signupForm = document.getElementById('signupForm');
const loginForm = document.getElementById('loginForm');

if (signupForm) {
    const businessNameInput = document.getElementById('businessName');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const subdomainInput = document.getElementById('subdomain');
    const passwordInput = document.getElementById('password');
    const signupBtn = document.getElementById('signupBtn');
    const togglePasswordBtn = document.getElementById('togglePassword');

    if (togglePasswordBtn) {
        togglePasswordBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const input = document.getElementById('password');
            input.type = input.type === 'password' ? 'text' : 'password';
        });
    }

    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        document.querySelectorAll('.error-message').forEach(el => el.textContent = '');

        const businessName = businessNameInput.value.trim();
        const email = emailInput.value.trim();
        const phone = phoneInput.value.trim();
        const subdomain = subdomainInput.value.trim();
        const password = passwordInput.value;

        let hasErrors = false;

        if (!businessName) {
            document.getElementById('businessNameError').textContent = 'الاسم التجاري مطلوب';
            hasErrors = true;
        }

        if (!email || !isValidEmail(email)) {
            document.getElementById('emailError').textContent = 'بريد إلكتروني صحيح مطلوب';
            hasErrors = true;
        }

        if (!subdomain || !isValidSubdomain(subdomain)) {
            document.getElementById('subdomainError').textContent = 'نطاق فرعي صحيح مطلوب';
            hasErrors = true;
        }

        if (!password || !isStrongPassword(password)) {
            document.getElementById('passwordError').textContent = 'كلمة مرور قوية مطلوبة (8 أحرف على الأقل)';
            hasErrors = true;
        }

        if (hasErrors) return;

        const btnText = signupBtn.querySelector('.btn-text');
        const btnLoader = signupBtn.querySelector('.btn-loader');
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline-flex';
        signupBtn.disabled = true;

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
            });

            if (error) {
                showToast(`خطأ: ${error.message}`, 'error');
                btnText.style.display = 'inline-flex';
                btnLoader.style.display = 'none';
                signupBtn.disabled = false;
                return;
            }

            const user = data.user;

            const { error: profileError } = await supabase
                .from('profiles')
                .insert([{
                    id: user.id,
                    business_name: businessName,
                    email,
                    phone,
                    subdomain,
                }]);

            if (profileError) {
                showToast('خطأ في حفظ البيانات', 'error');
                btnText.style.display = 'inline-flex';
                btnLoader.style.display = 'none';
                signupBtn.disabled = false;
                return;
            }

            // مسح الـ cache
            cacheSystem.clearAll();

            showToast('تم التسجيل بنجاح! جارٍ التوجيه...', 'success');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);

        } catch (error) {
            showToast(`خطأ: ${error.message}`, 'error');
            btnText.style.display = 'inline-flex';
            btnLoader.style.display = 'none';
            signupBtn.disabled = false;
        }
    });
}

if (loginForm) {
    const loginEmailInput = document.getElementById('loginEmail');
    const loginPasswordInput = document.getElementById('loginPassword');
    const loginBtn = document.getElementById('loginBtn');
    const toggleLoginPasswordBtn = document.getElementById('toggleLoginPassword');

    if (toggleLoginPasswordBtn) {
        toggleLoginPasswordBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const input = document.getElementById('loginPassword');
            input.type = input.type === 'password' ? 'text' : 'password';
        });
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        document.querySelectorAll('.error-message').forEach(el => el.textContent = '');

        const email = loginEmailInput.value.trim();
        const password = loginPasswordInput.value;

        if (!email || !isValidEmail(email)) {
            document.getElementById('loginEmailError').textContent = 'بريد إلكتروني صحيح مطلوب';
            return;
        }

        if (!password) {
            document.getElementById('loginPasswordError').textContent = 'كلمة المرور مطلوبة';
            return;
        }

        const btnText = loginBtn.querySelector('.btn-text');
        const btnLoader = loginBtn.querySelector('.btn-loader');
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline-flex';
        loginBtn.disabled = true;

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                showToast(`خطأ: ${error.message}`, 'error');
                btnText.style.display = 'inline-flex';
                btnLoader.style.display = 'none';
                loginBtn.disabled = false;
                return;
            }

            // مسح الـ cache
            cacheSystem.clearAll();

            showToast('تم تسجيل الدخول بنجاح!', 'success');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);

        } catch (error) {
            showToast(`خطأ: ${error.message}`, 'error');
            btnText.style.display = 'inline-flex';
            btnLoader.style.display = 'none';
            loginBtn.disabled = false;
        }
    });
}

/**
 * تبديل بين نموذج التسجيل والدخول
 */
function toggleForms() {
    const signupForm = document.getElementById('signupForm');
    const loginForm = document.getElementById('loginForm');
    const authTitle = document.getElementById('authTitle');
    const authSubtitle = document.getElementById('authSubtitle');

    if (signupForm && loginForm) {
        signupForm.classList.toggle('hidden');
        loginForm.classList.toggle('hidden');

        if (signupForm.classList.contains('hidden')) {
            authTitle.textContent = 'تسجيل الدخول';
            authSubtitle.textContent = 'أهلاً بعودتك';
        } else {
            authTitle.textContent = 'إنشاء حساب جديد';
            authSubtitle.textContent = 'ابدأ رحلتك مع بيزنس برو';
        }
    }
}

/* ========================================
   DASHBOARD PAGE - محسّن
   ======================================== */

const sidebarToggle = document.getElementById('sidebarToggle');
const sidebar = document.getElementById('sidebar');
const logoutBtn = document.getElementById('logoutBtn');

if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });

    sidebar.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            sidebar.classList.remove('open');
        });
    });
}

if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        try {
            await supabase.auth.signOut();
            cacheSystem.clearAll();
            showToast('تم تسجيل الخروج بنجاح', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } catch (error) {
            showToast(`خطأ: ${error.message}`, 'error');
        }
    });
}

/**
 * معالجة ملفات لوحة التحكم
 */
const navItems = document.querySelectorAll('.nav-item');
const modules = document.querySelectorAll('.module');

if (navItems.length > 0) {
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();

            navItems.forEach(el => el.classList.remove('active'));
            modules.forEach(el => el.classList.remove('active'));

            item.classList.add('active');
            const moduleName = item.getAttribute('data-module');
            const module = document.getElementById(`${moduleName}-module`);
            if (module) {
                module.classList.add('active');
            }
        });
    });
}

/* ========================================
   DASHBOARD DATA LOADING - محسّن جداً
   ======================================== */

async function loadDashboardData() {
    const user = await checkAuth();
    if (!user) return;

    // التحقق من وجود بيانات مخزنة مؤقتاً
    const cachedData = cacheSystem.get(`dashboard_${user.id}`);
    if (cachedData) {
        displayDashboardData(cachedData, user);
        // تحديث البيانات في الخلفية بدون انتظار
        loadDashboardDataInBackground(user);
        return;
    }

    // تحميل البيانات
    const data = await loadDashboardDataInBackground(user);
    if (data) {
        displayDashboardData(data, user);
    }
}

async function loadDashboardDataInBackground(user) {
    try {
        // تجميع جميع الطلبات معاً
        const promises = [
            requestBatcher.add(() =>
                supabase
                    .from('profiles')
                    .select('business_name')
                    .eq('id', user.id)
                    .single()
            ),
            requestBatcher.add(() =>
                supabase
                    .from('sales')
                    .select('amount')
                    .eq('user_id', user.id)
            ),
            requestBatcher.add(() =>
                supabase
                    .from('customers')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id)
            ),
            requestBatcher.add(() =>
                supabase
                    .from('products')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id)
            ),
            requestBatcher.add(() =>
                supabase
                    .from('sales')
                    .select(`
                        id,
                        amount,
                        created_at,
                        customer_id,
                        customers(name)
                    `)
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(5)
            )
        ];

        const results = await Promise.all(promises);

        const data = {
            profile: results[0].data,
            salesData: results[1].data || [],
            customerCount: results[2].count || 0,
            productCount: results[3].count || 0,
            recentSales: results[4].data || []
        };

        // تخزين البيانات مؤقتاً
        cacheSystem.set(`dashboard_${user.id}`, data);

        return data;

    } catch (error) {
        console.error('خطأ في تحميل البيانات:', error);
        showToast('خطأ في تحميل البيانات', 'error');
        return null;
    }
}

function displayDashboardData(data, user) {
    // عرض اسم المستخدم
    if (data.profile) {
        const businessName = data.profile.business_name;
        document.getElementById('userName').textContent = businessName;
        const firstLetter = businessName.charAt(0).toUpperCase();
        document.getElementById('userInitial').textContent = firstLetter;
    }

    // حساب إجمالي المبيعات
    const totalSales = data.salesData.reduce((sum, sale) => sum + (sale.amount || 0), 0);
    document.getElementById('totalSales').textContent = `${totalSales.toLocaleString('ar-EG')} ر.س`;

    // عرض عدد العملاء
    document.getElementById('totalCustomers').textContent = data.customerCount;

    // عرض عدد المنتجات
    document.getElementById('totalProducts').textContent = data.productCount;

    // حساب الأرباح
    const profit = totalSales * 0.3;
    document.getElementById('totalProfit').textContent = `${profit.toLocaleString('ar-EG')} ر.س`;

    // عرض آخر المبيعات
    const tbody = document.getElementById('recentSalesBody');
    if (tbody) {
        if (data.recentSales && data.recentSales.length > 0) {
            tbody.innerHTML = data.recentSales.map(sale => `
                <tr>
                    <td>${sale.customers?.name || 'عميل'}</td>
                    <td>منتج</td>
                    <td>${sale.amount.toLocaleString('ar-EG')} ر.س</td>
                    <td>${new Date(sale.created_at).toLocaleDateString('ar-EG')}</td>
                    <td><span class="badge success">مكتملة</span></td>
                </tr>
            `).join('');
        } else {
            tbody.innerHTML = `
                <tr class="empty-state">
                    <td colspan="5">
                        <div class="empty-content">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                <circle cx="12" cy="12" r="10"/>
                                <path d="M12 6v6l4 2"/>
                            </svg>
                            <p>لا توجد عمليات بيع حتى الآن</p>
                        </div>
                    </td>
                </tr>
            `;
        }
    }
}

// تحميل البيانات عند فتح الصفحة
// تحميل البيانات عند فتح الصفحة
if (window.location.pathname.includes('dashboard')) {
    loadDashboardData();

    // تحديث البيانات كل 30 ثانية
    setInterval(async () => {
        const user = await getCurrentUser();
        if (user && user.id) {
            cacheSystem.clear(`dashboard_${user.id}`);
            loadDashboardData();
        }
    }, 30000);
}
/* ========================================
   INITIALIZATION
   ======================================== */

document.addEventListener('DOMContentLoaded', async () => {
    if (window.location.pathname.includes('dashboard')) {
        await checkAuth();
    }
});