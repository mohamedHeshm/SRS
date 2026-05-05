/* ========================================
   SUPABASE CONFIGURATION
   ======================================== */

// ⚠️ استبدل هذه القيم ببيانات Supabase الخاصة بك
const SUPABASE_URL = 'https://vvdvnlfaqjmtivocxmbu.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Ye4vFPVmdCQJI1IgEFZX6Q_1rTl59QA';

let supabase;

// تهيئة Supabase
if (typeof window !== 'undefined' && window.supabase) {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

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
 * الحصول على المستخدم الحالي
 */
async function getCurrentUser() {
    if (!supabase) return null;
    const { data, error } = await supabase.auth.getSession();
    return data?.session?.user || null;
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

    // إغلاق القائمة عند النقر على رابط
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
    // عناصر نموذج التسجيل
    const businessNameInput = document.getElementById('businessName');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const subdomainInput = document.getElementById('subdomain');
    const passwordInput = document.getElementById('password');
    const signupBtn = document.getElementById('signupBtn');
    const togglePasswordBtn = document.getElementById('togglePassword');

    /**
     * تبديل رؤية كلمة المرور
     */
    if (togglePasswordBtn) {
        togglePasswordBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const input = document.getElementById('password');
            input.type = input.type === 'password' ? 'text' : 'password';
        });
    }

    /**
     * معالجة تقديم نموذج التسجيل
     */
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // تنظيف رسائل الخطأ
        document.querySelectorAll('.error-message').forEach(el => el.textContent = '');

        const businessName = businessNameInput.value.trim();
        const email = emailInput.value.trim();
        const phone = phoneInput.value.trim();
        const subdomain = subdomainInput.value.trim();
        const password = passwordInput.value;

        let hasErrors = false;

        // التحقق من الاسم التجاري
        if (!businessName) {
            document.getElementById('businessNameError').textContent = 'الاسم التجاري مطلوب';
            hasErrors = true;
        }

        // التحقق من البريد الإلكتروني
        if (!email || !isValidEmail(email)) {
            document.getElementById('emailError').textContent = 'بريد إلكتروني صحيح مطلوب';
            hasErrors = true;
        }

        // التحقق من النطاق الفرعي
        if (!subdomain || !isValidSubdomain(subdomain)) {
            document.getElementById('subdomainError').textContent = 'نطاق فرعي صحيح مطلوب (حروف وأرقام فقط)';
            hasErrors = true;
        }

        // التحقق من كلمة المرور
        if (!password || !isStrongPassword(password)) {
            document.getElementById('passwordError').textContent = 'كلمة مرور قوية مطلوبة (8 أحرف على الأقل)';
            hasErrors = true;
        }

        if (hasErrors) return;

        // إظهار حالة التحميل
        const btnText = signupBtn.querySelector('.btn-text');
        const btnLoader = signupBtn.querySelector('.btn-loader');
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline-flex';
        signupBtn.disabled = true;

        try {
            // التسجيل عبر Supabase Auth
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

            // حفظ بيانات الملف الشخصي
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
    // عناصر نموذج تسجيل الدخول
    const loginEmailInput = document.getElementById('loginEmail');
    const loginPasswordInput = document.getElementById('loginPassword');
    const loginBtn = document.getElementById('loginBtn');
    const toggleLoginPasswordBtn = document.getElementById('toggleLoginPassword');

    /**
     * تبديل رؤية كلمة المرور
     */
    if (toggleLoginPasswordBtn) {
        toggleLoginPasswordBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const input = document.getElementById('loginPassword');
            input.type = input.type === 'password' ? 'text' : 'password';
        });
    }

    /**
     * معالجة تقديم نموذج تسجيل الدخول
     */
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // تنظيف رسائل الخطأ
        document.getElementById('loginEmailError').textContent = '';
        document.getElementById('loginPasswordError').textContent = '';

        const email = loginEmailInput.value.trim();
        const password = loginPasswordInput.value;

        let hasErrors = false;

        if (!email || !isValidEmail(email)) {
            document.getElementById('loginEmailError').textContent = 'بريد إلكتروني صحيح مطلوب';
            hasErrors = true;
        }

        if (!password) {
            document.getElementById('loginPasswordError').textContent = 'كلمة المرور مطلوبة';
            hasErrors = true;
        }

        if (hasErrors) return;

        // إظهار حالة التحميل
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
   DASHBOARD PAGE
   ======================================== */

const sidebarToggle = document.getElementById('sidebarToggle');
const sidebar = document.getElementById('sidebar');
const logoutBtn = document.getElementById('logoutBtn');

/**
 * تبديل الشريط الجانبي
 */
if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });

    // إغلاق الشريط الجانبي عند النقر على ارتباط
    sidebar.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            sidebar.classList.remove('open');
        });
    });
}

/**
 * تسجيل الخروج
 */
if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        try {
            await supabase.auth.signOut();
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

            // إزالة الحالة النشطة من جميع العناصر
            navItems.forEach(el => el.classList.remove('active'));
            modules.forEach(el => el.classList.remove('active'));

            // إضافة الحالة النشطة للعنصر المختار
            item.classList.add('active');
            const moduleName = item.getAttribute('data-module');
            const module = document.getElementById(`${moduleName}-module`);
            if (module) {
                module.classList.add('active');
            }
        });
    });
}

/**
 * تحميل بيانات لوحة التحكم
 */
async function loadDashboardData() {
    const user = await checkAuth();
    if (!user) return;

    try {
        // تعيين اسم المستخدم
        const { data: profile } = await supabase
            .from('profiles')
            .select('business_name')
            .eq('id', user.id)
            .single();

        if (profile) {
            const businessName = profile.business_name;
            document.getElementById('userName').textContent = businessName;
            
            // تعيين الحرف الأول من اسم الشركة
            const firstLetter = businessName.charAt(0).toUpperCase();
            document.getElementById('userInitial').textContent = firstLetter;
        }

        // جلب إجمالي المبيعات
        const { data: sales } = await supabase
            .from('sales')
            .select('amount')
            .eq('user_id', user.id);

        const totalSales = sales ? sales.reduce((sum, sale) => sum + (sale.amount || 0), 0) : 0;
        document.getElementById('totalSales').textContent = `${totalSales.toLocaleString('ar-EG')} ر.س`;

        // جلب عدد العملاء
        const { count: customerCount } = await supabase
            .from('customers')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);

        document.getElementById('totalCustomers').textContent = customerCount || 0;

        // جلب عدد المنتجات
        const { count: productCount } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);

        document.getElementById('totalProducts').textContent = productCount || 0;

        // حساب الأرباح (افترضنا أن الأرباح = إجمالي المبيعات × 30%)
        const profit = totalSales * 0.3;
        document.getElementById('totalProfit').textContent = `${profit.toLocaleString('ar-EG')} ر.س`;

        // جلب آخر المبيعات
        const { data: recentSales } = await supabase
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
            .limit(5);

        // عرض آخر المبيعات في الجدول
        const tbody = document.getElementById('recentSalesBody');
        if (tbody) {
            if (recentSales && recentSales.length > 0) {
                tbody.innerHTML = recentSales.map(sale => `
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

    } catch (error) {
        console.error('خطأ في تحميل البيانات:', error);
        showToast('خطأ في تحميل البيانات', 'error');
    }
}

// تحميل البيانات عند فتح الصفحة
if (window.location.pathname.includes('dashboard')) {
    loadDashboardData();
    
    // تحديث البيانات كل 30 ثانية
    setInterval(loadDashboardData, 30000);
}

/* ========================================
   INITIALIZATION
   ======================================== */

// التحقق من المصادقة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', async () => {
    if (window.location.pathname.includes('dashboard')) {
        await checkAuth();
    }
});
