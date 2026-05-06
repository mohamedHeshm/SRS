// ========================================
// تكوين Supabase
// ========================================
const SUPABASE_URL = 'https://vvdvnlfaqjmtivocxmbu.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Ye4vFPVmdCQJI1IgEFZX6Q_1rTl59QA';

// تهيئة Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// التحقق من التهيئة
console.log('Supabase initialized:', supabase ? '✅' : '❌');

/* ========================================
   CACHE SYSTEM
   ======================================== */
const cacheSystem = {
    data: {},
    timestamps: {},
    cacheDuration: 5 * 60 * 1000,

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
   UTILITY FUNCTIONS
   ======================================== */
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    setTimeout(() => toast.classList.remove('show'), 4000);
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isStrongPassword(password) {
    return password.length >= 8;
}

function isValidSubdomain(subdomain) {
    return /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/i.test(subdomain) && subdomain.length > 0 && subdomain.length <= 63;
}

async function getCurrentUser() {
    if (!supabase) return null;
    const cached = cacheSystem.get('currentUser');
    if (cached) return cached;
    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) return null;
        const user = session?.user || null;
        if (user) cacheSystem.set('currentUser', user);
        return user;
    } catch (error) {
        console.error('getCurrentUser error:', error);
        return null;
    }
}

async function checkAuth() {
    const user = await getCurrentUser();
    if (!user && window.location.pathname.includes('dashboard')) {
        window.location.href = 'auth.html';
    }
    return user;
}

/* ========================================
   MOBILE MENU
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
   AUTH PAGE - SIGNUP (محسن)
   ======================================== */
const signupForm = document.getElementById('signupForm');
const loginForm = document.getElementById('loginForm');

if (signupForm) {
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

        const businessName = document.getElementById('businessName').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const subdomain = document.getElementById('subdomain').value.trim();
        const password = document.getElementById('password').value;

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

        const signupBtn = document.getElementById('signupBtn');
        const btnText = signupBtn.querySelector('.btn-text');
        const btnLoader = signupBtn.querySelector('.btn-loader');
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline-flex';
        signupBtn.disabled = true;

        try {
            console.log('جاري إنشاء الحساب لـ:', email);

            // 1. إنشاء حساب في Auth
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
            });

            if (error) {
                console.error('خطأ في التسجيل:', error);
                showToast(error.message, 'error');
                btnText.style.display = 'inline-flex';
                btnLoader.style.display = 'none';
                signupBtn.disabled = false;
                return;
            }

            if (!data.user) {
                console.error('لم يتم إنشاء المستخدم');
                showToast('حدث خطأ غير متوقع', 'error');
                btnText.style.display = 'inline-flex';
                btnLoader.style.display = 'none';
                signupBtn.disabled = false;
                return;
            }

            console.log('تم إنشاء الحساب بنجاح:', data.user.id);

            // 2. حفظ البيانات في جدول profiles
            const { error: profileError } = await supabase
                .from('profiles')
                .insert({
                    id: data.user.id,
                    business_name: businessName,
                    email: email,
                    phone: phone,
                    subdomain: subdomain,
                });

            if (profileError) {
                console.error('خطأ في حفظ الملف الشخصي:', profileError);
                showToast('تم إنشاء الحساب ولكن حدث خطأ في حفظ البيانات: ' + profileError.message, 'warning');
            } else {
                console.log('تم حفظ الملف الشخصي بنجاح');
            }

            cacheSystem.clearAll();
            showToast('تم التسجيل بنجاح! جارٍ التوجيه...', 'success');

            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 2000);

        } catch (error) {
            console.error('خطأ غير متوقع:', error);
            showToast(error.message || 'حدث خطأ غير متوقع', 'error');
            btnText.style.display = 'inline-flex';
            btnLoader.style.display = 'none';
            signupBtn.disabled = false;
        }
    });
}

/* ========================================
   AUTH PAGE - LOGIN
   ======================================== */
if (loginForm) {
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

        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;

        if (!email || !isValidEmail(email)) {
            document.getElementById('loginEmailError').textContent = 'بريد إلكتروني صحيح مطلوب';
            return;
        }
        if (!password) {
            document.getElementById('loginPasswordError').textContent = 'كلمة المرور مطلوبة';
            return;
        }

        const loginBtn = document.getElementById('loginBtn');
        const btnText = loginBtn.querySelector('.btn-text');
        const btnLoader = loginBtn.querySelector('.btn-loader');
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline-flex';
        loginBtn.disabled = true;

        try {
            console.log('جاري تسجيل الدخول لـ:', email);

            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                console.error('خطأ في تسجيل الدخول:', error);
                showToast(error.message, 'error');
                btnText.style.display = 'inline-flex';
                btnLoader.style.display = 'none';
                loginBtn.disabled = false;
                return;
            }

            console.log('تم تسجيل الدخول بنجاح');
            cacheSystem.clearAll();
            showToast('تم تسجيل الدخول بنجاح!', 'success');

            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);

        } catch (error) {
            console.error('خطأ غير متوقع:', error);
            showToast(error.message || 'حدث خطأ غير متوقع', 'error');
            btnText.style.display = 'inline-flex';
            btnLoader.style.display = 'none';
            loginBtn.disabled = false;
        }
    });
}

function toggleForms() {
    const signupFormEl = document.getElementById('signupForm');
    const loginFormEl = document.getElementById('loginForm');
    const authTitle = document.getElementById('authTitle');
    const authSubtitle = document.getElementById('authSubtitle');

    if (signupFormEl && loginFormEl) {
        signupFormEl.classList.toggle('hidden');
        loginFormEl.classList.toggle('hidden');

        if (signupFormEl.classList.contains('hidden')) {
            authTitle.textContent = 'تسجيل الدخول';
            authSubtitle.textContent = 'أهلاً بعودتك';
        } else {
            authTitle.textContent = 'إنشاء حساب جديد';
            authSubtitle.textContent = 'ابدأ رحلتك مع بيزنس برو';
        }
    }
}

/* ========================================
   DASHBOARD
   ======================================== */
const sidebarToggle = document.getElementById('sidebarToggle');
const sidebar = document.getElementById('sidebar');
const logoutBtn = document.getElementById('logoutBtn');

if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', () => sidebar.classList.toggle('open'));
    if (sidebar.querySelectorAll) {
        sidebar.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => sidebar.classList.remove('open'));
        });
    }
}

if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        await supabase.auth.signOut();
        cacheSystem.clearAll();
        showToast('تم تسجيل الخروج بنجاح', 'success');
        setTimeout(() => window.location.href = 'index.html', 1500);
    });
}

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
            if (module) module.classList.add('active');
        });
    });
}

async function loadDashboardData() {
    const user = await checkAuth();
    if (!user) return;

    const cachedData = cacheSystem.get(`dashboard_${user.id}`);
    if (cachedData) {
        displayDashboardData(cachedData);
        return;
    }

    try {
        const { data: profile } = await supabase
            .from('profiles')
            .select('business_name')
            .eq('id', user.id)
            .single();

        const { data: sales } = await supabase
            .from('sales')
            .select('amount')
            .eq('user_id', user.id);

        const { count: customerCount } = await supabase
            .from('customers')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);

        const { count: productCount } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);

        const data = {
            profile: profile,
            salesData: sales || [],
            customerCount: customerCount || 0,
            productCount: productCount || 0
        };

        cacheSystem.set(`dashboard_${user.id}`, data);
        displayDashboardData(data);

    } catch (error) {
        console.error('خطأ في تحميل البيانات:', error);
        // عرض بيانات تجريبية إذا لم تكن الجداول موجودة
        displayDemoData();
    }
}

function displayDashboardData(data) {
    if (data.profile) {
        const businessName = data.profile.business_name;
        const userNameElement = document.getElementById('userName');
        const userInitialElement = document.getElementById('userInitial');
        if (userNameElement) userNameElement.textContent = businessName;
        if (userInitialElement) userInitialElement.textContent = businessName.charAt(0).toUpperCase();
    }

    const totalSales = data.salesData.reduce((sum, sale) => sum + (sale.amount || 0), 0);

    const totalSalesElement = document.getElementById('totalSales');
    const totalCustomersElement = document.getElementById('totalCustomers');
    const totalProductsElement = document.getElementById('totalProducts');
    const totalProfitElement = document.getElementById('totalProfit');

    if (totalSalesElement) totalSalesElement.textContent = `${totalSales.toLocaleString('ar-EG')} ر.س`;
    if (totalCustomersElement) totalCustomersElement.textContent = data.customerCount;
    if (totalProductsElement) totalProductsElement.textContent = data.productCount;
    if (totalProfitElement) totalProfitElement.textContent = `${(totalSales * 0.3).toLocaleString('ar-EG')} ر.س`;
}

function displayDemoData() {
    const userNameElement = document.getElementById('userName');
    const userInitialElement = document.getElementById('userInitial');
    if (userNameElement) userNameElement.textContent = 'مرحباً بك';
    if (userInitialElement) userInitialElement.textContent = 'M';

    document.getElementById('totalSales').textContent = '0 ر.س';
    document.getElementById('totalCustomers').textContent = '0';
    document.getElementById('totalProducts').textContent = '0';
    document.getElementById('totalProfit').textContent = '0 ر.س';
}

// تشغيل لوحة التحكم
if (window.location.pathname.includes('dashboard')) {
    loadDashboardData();
}

document.addEventListener('DOMContentLoaded', async () => {
    if (window.location.pathname.includes('dashboard')) {
        await checkAuth();
    }
});