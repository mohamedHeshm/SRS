/* =========================================================
   GOLDEN PASS — script.js
   ========================================================= */

// ── Supabase ──────────────────────────────────────────────
const SUPABASE_URL      = 'https://vvdvnlfaqjmtivocxmbu.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Ye4vFPVmdCQJI1IgEFZX6Q_1rTl59QA';

let supabaseClient = null;

function initSupabase() {
    if (typeof window.supabase === 'undefined' || !window.supabase.createClient) {
        console.warn('Supabase library not loaded');
        return false;
    }
    if (!supabaseClient) {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log("Supabase initialized:", supabaseClient ? 'OK' : 'FAIL');
    }
    return true;
}

// ── Cache ─────────────────────────────────────────────────
const cacheSystem = {
    data: {}, timestamps: {}, cacheDuration: 5 * 60 * 1000,
    set(key, value) { this.data[key] = value; this.timestamps[key] = Date.now(); },
    get(key) {
        if (!this.data[key]) return null;
        if (Date.now() - this.timestamps[key] > this.cacheDuration) { this.clear(key); return null; }
        return this.data[key];
    },
    clear(key) { delete this.data[key]; delete this.timestamps[key]; },
    clearAll() { this.data = {}; this.timestamps = {}; }
};

// ── Toast ─────────────────────────────────────────────────
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    setTimeout(() => toast.classList.remove('show'), 4000);
}

// ── Validators ────────────────────────────────────────────
function isValidEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
function isStrongPassword(p) { return p.length >= 8; }
function isValidSubdomain(s) { return /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/i.test(s) && s.length > 0 && s.length <= 63; }

// ── Button loader ─────────────────────────────────────────
function setButtonLoading(btn, loading) {
    if (!btn) return;
    const t = btn.querySelector('.btn-text');
    const l = btn.querySelector('.btn-loader');
    if (loading) {
        if (t) t.style.display = 'none';
        if (l) l.style.display = 'inline-flex';
        btn.disabled = true;
    } else {
        if (t) t.style.display = 'inline-flex';
        if (l) l.style.display = 'none';
        btn.disabled = false;
    }
}

// ── null-safe setText ─────────────────────────────────────
function setText(id, value) { const el = document.getElementById(id); if (el) el.textContent = value; }

// ── Auth helpers ──────────────────────────────────────────
async function getCurrentUser() {
    if (!supabaseClient) return null;
    const cached = cacheSystem.get('currentUser');
    if (cached) return cached;
    try {
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        if (error) return null;
        const user = session?.user || null;
        if (user) cacheSystem.set('currentUser', user);
        return user;
    } catch (e) { console.error('getCurrentUser:', e); return null; }
}

async function checkAuth() {
    const user = await getCurrentUser();
    if (!user && window.location.pathname.includes('dashboard')) window.location.href = 'auth.html';
    return user;
}

// ── Form toggling ─────────────────────────────────────────
function toggleForms() {
    const sf = document.getElementById('signupForm');
    const lf = document.getElementById('loginForm');
    const t  = document.getElementById('authTitle');
    const s  = document.getElementById('authSubtitle');
    if (!sf || !lf) return;
    sf.classList.toggle('hidden');
    lf.classList.toggle('hidden');
    if (sf.classList.contains('hidden')) {
        if (t) t.textContent = 'تسجيل الدخول';
        if (s) s.textContent = 'أهلاً بعودتك';
    } else {
        if (t) t.textContent = 'إنشاء حساب جديد';
        if (s) s.textContent = 'ابدأ رحلتك مع GOLDEN PASS';
    }
}

// =========================================================
// MAIN — everything runs after DOM ready
// =========================================================
document.addEventListener('DOMContentLoaded', async () => {

    initSupabase();

    const path = window.location.pathname;

    // ── Mobile nav ────────────────────────────────────────
    const menuToggle = document.getElementById('mobileMenuToggle');
    const navMenu    = document.getElementById('navbarMenu');
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });
        navMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
            navMenu.classList.remove('active');
            menuToggle.classList.remove('active');
        }));
    }

    // ── AUTH PAGE ─────────────────────────────────────────
    const signupForm = document.getElementById('signupForm');
    const loginForm  = document.getElementById('loginForm');

    if (signupForm || loginForm) {

        // Password toggles
        ['togglePassword', 'toggleLoginPassword'].forEach(id => {
            const btn = document.getElementById(id);
            if (!btn) return;
            btn.addEventListener('click', e => {
                e.preventDefault();
                const inp = document.getElementById(id === 'togglePassword' ? 'password' : 'loginPassword');
                if (inp) inp.type = inp.type === 'password' ? 'text' : 'password';
            });
        });

        // Signup
        if (signupForm) {
            signupForm.addEventListener('submit', async e => {
                e.preventDefault();

                ['businessNameError','emailError','subdomainError','passwordError'].forEach(id => setText(id, ''));

                const businessName = document.getElementById('businessName')?.value.trim() || '';
                const email        = document.getElementById('email')?.value.trim() || '';
                const phone        = document.getElementById('phone')?.value.trim() || '';
                const subdomain    = document.getElementById('subdomain')?.value.trim() || '';
                const password     = document.getElementById('password')?.value || '';

                let hasErrors = false;
                if (!businessName) { setText('businessNameError', 'الاسم التجاري مطلوب'); hasErrors = true; }
                if (!email || !isValidEmail(email)) { setText('emailError', 'بريد إلكتروني صحيح مطلوب'); hasErrors = true; }
                if (!subdomain || !isValidSubdomain(subdomain)) { setText('subdomainError', 'نطاق فرعي صحيح مطلوب (أحرف إنجليزية وأرقام فقط)'); hasErrors = true; }
                if (!password || !isStrongPassword(password)) { setText('passwordError', 'كلمة مرور قوية مطلوبة (8 أحرف على الأقل)'); hasErrors = true; }
                if (hasErrors) return;

                if (!supabaseClient) { showToast('خطأ في الاتصال بالخادم، أعد تحميل الصفحة', 'error'); return; }

                const signupBtn = document.getElementById('signupBtn');
                setButtonLoading(signupBtn, true);

                try {
                    const { data, error } = await supabaseClient.auth.signUp({ email, password });
                    if (error) { showToast(error.message, 'error'); setButtonLoading(signupBtn, false); return; }
                    if (!data.user) { showToast('حدث خطأ غير متوقع، حاول مرة أخرى', 'error'); setButtonLoading(signupBtn, false); return; }

                    if (!data.session) {
                        showToast('تم إرسال رابط التأكيد إلى بريدك. يرجى تأكيده قبل تسجيل الدخول.', 'info');
                        setButtonLoading(signupBtn, false);
                        return;
                    }

                    const { error: profileError } = await supabaseClient.from('profiles').insert({
                        id: data.user.id, business_name: businessName, email, phone, subdomain
                    });
                    if (profileError) console.error('profile error:', profileError);

                    cacheSystem.clearAll();
                    showToast('تم التسجيل بنجاح! جارٍ التوجيه...', 'success');
                    setTimeout(() => { window.location.href = 'dashboard.html'; }, 2000);

                } catch (err) {
                    console.error(err);
                    showToast(err.message || 'حدث خطأ غير متوقع', 'error');
                    setButtonLoading(signupBtn, false);
                }
            });
        }

        // Login
        if (loginForm) {
            loginForm.addEventListener('submit', async e => {
                e.preventDefault();

                ['loginEmailError','loginPasswordError'].forEach(id => setText(id, ''));

                const email    = document.getElementById('loginEmail')?.value.trim() || '';
                const password = document.getElementById('loginPassword')?.value || '';

                if (!email || !isValidEmail(email)) { setText('loginEmailError', 'بريد إلكتروني صحيح مطلوب'); return; }
                if (!password) { setText('loginPasswordError', 'كلمة المرور مطلوبة'); return; }

                if (!supabaseClient) { showToast('خطأ في الاتصال بالخادم، أعد تحميل الصفحة', 'error'); return; }

                const loginBtn = document.getElementById('loginBtn');
                setButtonLoading(loginBtn, true);

                try {
                    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
                    if (error) { showToast(error.message, 'error'); setButtonLoading(loginBtn, false); return; }

                    cacheSystem.clearAll();
                    showToast('تم تسجيل الدخول بنجاح!', 'success');
                    setTimeout(() => { window.location.href = 'dashboard.html'; }, 1500);

                } catch (err) {
                    console.error(err);
                    showToast(err.message || 'حدث خطأ غير متوقع', 'error');
                    setButtonLoading(loginBtn, false);
                }
            });
        }
    }

    // ── DASHBOARD PAGE ────────────────────────────────────
    if (path.includes('dashboard')) {
        await checkAuth();

        const sidebarToggle = document.getElementById('sidebarToggle');
        const sidebar       = document.getElementById('sidebar');
        if (sidebarToggle && sidebar) {
            sidebarToggle.addEventListener('click', () => sidebar.classList.toggle('open'));
            sidebar.querySelectorAll('.nav-item').forEach(i => i.addEventListener('click', () => sidebar.classList.remove('open')));
        }

        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async () => {
                if (supabaseClient) await supabaseClient.auth.signOut();
                cacheSystem.clearAll();
                showToast('تم تسجيل الخروج بنجاح', 'success');
                setTimeout(() => { window.location.href = 'index.html'; }, 1500);
            });
        }

        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', e => {
                e.preventDefault();
                document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
                document.querySelectorAll('.module').forEach(el => el.classList.remove('active'));
                item.classList.add('active');
                const mod = document.getElementById(`${item.getAttribute('data-module')}-module`);
                if (mod) mod.classList.add('active');
            });
        });

        loadDashboardData();
    }
});

// ── Dashboard data ────────────────────────────────────────
async function loadDashboardData() {
    const user = await getCurrentUser();
    if (!user) return;

    const cachedData = cacheSystem.get(`dashboard_${user.id}`);
    if (cachedData) { displayDashboardData(cachedData); return; }

    try {
        const [profileRes, salesRes, customerRes, productRes] = await Promise.all([
            supabaseClient.from('profiles').select('business_name').eq('id', user.id).single(),
            supabaseClient.from('sales').select('total_amount, created_at, payment_status, customers(name)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
            supabaseClient.from('customers').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
            supabaseClient.from('products').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        ]);

        // Log warnings for missing tables without crashing
        if (profileRes.error)  console.warn('profiles table:', profileRes.error.message);
        if (salesRes.error)    console.warn('sales table:', salesRes.error.message);
        if (customerRes.error) console.warn('customers table:', customerRes.error.message);
        if (productRes.error)  console.warn('products table:', productRes.error.message);

        const data = {
            profile:       profileRes.data   || null,
            salesData:     salesRes.data     || [],
            customerCount: customerRes.count || 0,
            productCount:  productRes.count  || 0,
        };
        cacheSystem.set(`dashboard_${user.id}`, data);
        displayDashboardData(data);

    } catch (err) {
        console.error('Dashboard load error:', err);
        displayDemoData();
    }
}

function displayDashboardData(data) {
    if (data.profile) {
        const name = data.profile.business_name || '';
        setText('userName', name);
        setText('userInitial', name.charAt(0).toUpperCase());
    }
    const totalSales = data.salesData.reduce((sum, s) => sum + (s.total_amount || 0), 0);
    setText('totalSales',     `${totalSales.toLocaleString('ar-EG')} ج.م`);
    setText('totalCustomers', data.customerCount);
    setText('totalProducts',  data.productCount);
    setText('totalProfit',    `${(totalSales * 0.3).toLocaleString('ar-EG')} ج.م`);

    // Render recent sales table
    const tbody = document.getElementById('recentSalesBody');
    if (tbody && data.salesData.length > 0) {
        const statusMap = { paid: 'مدفوع', unpaid: 'غير مدفوع', partial: 'جزئي' };
        const statusClass = { paid: 'positive', unpaid: 'negative', partial: 'neutral' };
        tbody.innerHTML = data.salesData.map(s => {
            const date = new Date(s.created_at).toLocaleDateString('ar-EG');
            const status = s.payment_status || 'unpaid';
            const customerName = s.customers?.name || '—';
            return `<tr>
                <td>${customerName}</td>
                <td>—</td>
                <td>${(s.total_amount || 0).toLocaleString('ar-EG')} ج.م</td>
                <td>${date}</td>
                <td><span class="stat-change ${statusClass[status] || 'neutral'}">${statusMap[status] || status}</span></td>
            </tr>`;
        }).join('');
    }
}

function displayDemoData() {
    setText('userName',       'مرحباً بك');
    setText('userInitial',    'G');
    setText('totalSales',     '0 ج.م');
    setText('totalCustomers', '0');
    setText('totalProducts',  '0');
    setText('totalProfit',    '0 ج.م');
}