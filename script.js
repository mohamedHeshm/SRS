/* =========================================================
   GOLDEN PASS — script.js  (FULL VERSION)
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

// ── Module switching ──────────────────────────────────────
function switchModule(moduleName) {
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.module').forEach(el => el.classList.remove('active'));
    const navItem = document.querySelector(`[data-module="${moduleName}"]`);
    if (navItem) navItem.classList.add('active');
    const mod = document.getElementById(`${moduleName}-module`);
    if (mod) mod.classList.add('active');
    loadModuleData(moduleName);
}

// ── Modal helpers ─────────────────────────────────────────
function openModal(id) {
    const m = document.getElementById(id);
    if (m) m.classList.add('active');
}
function closeModal(id) {
    const m = document.getElementById(id);
    if (m) m.classList.remove('active');
}
function closeModalOutside(e, id) {
    if (e.target.id === id) closeModal(id);
}

// ── Confirm delete helper ─────────────────────────────────
function confirmDelete(message, onConfirm) {
    setText('confirmDeleteMsg', message);
    openModal('confirmDeleteModal');
    const btn = document.getElementById('confirmDeleteBtn');
    btn.onclick = () => { closeModal('confirmDeleteModal'); onConfirm(); };
}

// ── Format helpers ────────────────────────────────────────
function formatMoney(n) {
    return Number(n || 0).toLocaleString('ar-EG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ج.م';
}
function formatDate(d) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('ar-EG');
}
function statusBadge(status, map) {
    const labels = map || {};
    const classes = { paid: 'badge-success', unpaid: 'badge-danger', partial: 'badge-warning', active: 'badge-success', inactive: 'badge-secondary', approved: 'badge-success' };
    const label = labels[status] || status;
    const cls   = classes[status] || 'badge-secondary';
    return `<span class="badge ${cls}">${label}</span>`;
}

// =========================================================
// MAIN
// =========================================================
document.addEventListener('DOMContentLoaded', async () => {

    initSupabase();

    const path = window.location.pathname;

    // ── Mobile nav ──────────────────────────────────────
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

    // ── AUTH PAGE ────────────────────────────────────────
    const signupForm = document.getElementById('signupForm');
    const loginForm  = document.getElementById('loginForm');

    if (signupForm || loginForm) {
        ['togglePassword','toggleLoginPassword'].forEach(id => {
            const btn = document.getElementById(id);
            if (!btn) return;
            btn.addEventListener('click', e => {
                e.preventDefault();
                const inp = document.getElementById(id === 'togglePassword' ? 'password' : 'loginPassword');
                if (inp) inp.type = inp.type === 'password' ? 'text' : 'password';
            });
        });

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
                if (!subdomain || !isValidSubdomain(subdomain)) { setText('subdomainError', 'نطاق فرعي صحيح مطلوب'); hasErrors = true; }
                if (!password || !isStrongPassword(password)) { setText('passwordError', 'كلمة مرور 8 أحرف على الأقل'); hasErrors = true; }
                if (hasErrors) return;

                if (!supabaseClient) { showToast('خطأ في الاتصال بالخادم', 'error'); return; }

                const signupBtn = document.getElementById('signupBtn');
                setButtonLoading(signupBtn, true);
                try {
                    const { data, error } = await supabaseClient.auth.signUp({ email, password });
                    if (error) { showToast(error.message, 'error'); setButtonLoading(signupBtn, false); return; }
                    if (!data.user) { showToast('حدث خطأ غير متوقع', 'error'); setButtonLoading(signupBtn, false); return; }

                    if (!data.session) {
                        showToast('تم إرسال رابط التأكيد إلى بريدك.', 'info');
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
                    showToast(err.message || 'حدث خطأ غير متوقع', 'error');
                    setButtonLoading(signupBtn, false);
                }
            });
        }

        if (loginForm) {
            loginForm.addEventListener('submit', async e => {
                e.preventDefault();
                ['loginEmailError','loginPasswordError'].forEach(id => setText(id, ''));
                const email    = document.getElementById('loginEmail')?.value.trim() || '';
                const password = document.getElementById('loginPassword')?.value || '';
                if (!email || !isValidEmail(email)) { setText('loginEmailError', 'بريد إلكتروني صحيح مطلوب'); return; }
                if (!password) { setText('loginPasswordError', 'كلمة المرور مطلوبة'); return; }
                if (!supabaseClient) { showToast('خطأ في الاتصال بالخادم', 'error'); return; }

                const loginBtn = document.getElementById('loginBtn');
                setButtonLoading(loginBtn, true);
                try {
                    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
                    if (error) { showToast(error.message, 'error'); setButtonLoading(loginBtn, false); return; }
                    cacheSystem.clearAll();
                    showToast('تم تسجيل الدخول بنجاح!', 'success');
                    setTimeout(() => { window.location.href = 'dashboard.html'; }, 1500);
                } catch (err) {
                    showToast(err.message || 'حدث خطأ غير متوقع', 'error');
                    setButtonLoading(loginBtn, false);
                }
            });
        }
    }

    // ── DASHBOARD PAGE ───────────────────────────────────
    if (path.includes('dashboard')) {
        await checkAuth();

        // Sidebar toggle
        const sidebarToggle = document.getElementById('sidebarToggle');
        const sidebar       = document.getElementById('sidebar');
        if (sidebarToggle && sidebar) {
            sidebarToggle.addEventListener('click', () => sidebar.classList.toggle('open'));
            sidebar.querySelectorAll('.nav-item').forEach(i => i.addEventListener('click', () => sidebar.classList.remove('open')));
        }

        // Logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async () => {
                if (supabaseClient) await supabaseClient.auth.signOut();
                cacheSystem.clearAll();
                showToast('تم تسجيل الخروج بنجاح', 'success');
                setTimeout(() => { window.location.href = 'index.html'; }, 1500);
            });
        }

        // Nav items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', e => {
                e.preventDefault();
                const moduleName = item.getAttribute('data-module');
                document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
                document.querySelectorAll('.module').forEach(el => el.classList.remove('active'));
                item.classList.add('active');
                const mod = document.getElementById(`${moduleName}-module`);
                if (mod) mod.classList.add('active');
                loadModuleData(moduleName);
            });
        });

        // Set today's date on expense/employee forms
        const today = new Date().toISOString().split('T')[0];
        const expDate = document.getElementById('exp_date');
        if (expDate) expDate.value = today;

        loadModuleData('dashboard');
    }
});

// ── Load data per module ──────────────────────────────────
async function loadModuleData(moduleName) {
    switch (moduleName) {
        case 'dashboard':  await loadDashboardData(); break;
        case 'sales':      await loadSales(); break;
        case 'customers':  await loadCustomers(); break;
        case 'inventory':  await loadProducts(); break;
        case 'accounting': await loadAccounting(); break;
        case 'hr':         await loadEmployees(); break;
        case 'settings':   await loadSettings(); break;
    }
}

// =========================================================
// DASHBOARD
// =========================================================
async function loadDashboardData() {
    const user = await getCurrentUser();
    if (!user || !supabaseClient) return;

    try {
        const [profileRes, salesRes, customerRes, productRes, expenseRes] = await Promise.all([
            supabaseClient.from('profiles').select('business_name').eq('id', user.id).single(),
            supabaseClient.from('sales').select('total_amount, created_at, payment_status, customers(name)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
            supabaseClient.from('customers').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
            supabaseClient.from('products').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
            supabaseClient.from('expenses').select('amount').eq('user_id', user.id),
        ]);

        const name = profileRes.data?.business_name || '';
        setText('userName', name);
        setText('userInitial', name.charAt(0).toUpperCase() || 'G');

        const salesData = salesRes.data || [];
        const totalSales = salesData.reduce((s, r) => s + Number(r.total_amount || 0), 0);
        setText('totalSales', formatMoney(totalSales));
        setText('totalCustomers', customerRes.count || 0);
        setText('totalProducts', productRes.count || 0);

        const totalExpenses = (expenseRes.data || []).reduce((s, r) => s + Number(r.amount || 0), 0);
        setText('totalExpenses', formatMoney(totalExpenses));

        // Recent sales table
        const tbody = document.getElementById('recentSalesBody');
        if (tbody) {
            if (salesData.length === 0) {
                tbody.innerHTML = `<tr class="empty-state"><td colspan="4"><div class="empty-content"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg><p>لا توجد مبيعات حتى الآن</p></div></td></tr>`;
            } else {
                tbody.innerHTML = salesData.map(s => `
                    <tr>
                        <td>${s.customers?.name || '—'}</td>
                        <td>${formatMoney(s.total_amount)}</td>
                        <td>${formatDate(s.created_at)}</td>
                        <td>${statusBadge(s.payment_status, { paid: 'مدفوع', unpaid: 'غير مدفوع', partial: 'جزئي' })}</td>
                    </tr>`).join('');
            }
        }
    } catch (err) {
        console.error('Dashboard error:', err);
    }
}

// =========================================================
// SALES
// =========================================================
let allSales = [];

async function loadSales() {
    const user = await getCurrentUser();
    if (!user || !supabaseClient) return;
    try {
        const { data, error } = await supabaseClient
            .from('sales')
            .select('*, customers(name)')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
        if (error) throw error;
        allSales = data || [];
        renderSales(allSales);
        await populateCustomerSelect('sale_customer_id');
    } catch (err) {
        console.error('loadSales:', err);
        showToast('خطأ في تحميل المبيعات', 'error');
    }
}

function renderSales(data) {
    const tbody = document.getElementById('salesTableBody');
    if (!tbody) return;
    if (!data || data.length === 0) {
        tbody.innerHTML = `<tr class="empty-state"><td colspan="6"><div class="empty-content"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg><p>لا توجد مبيعات حتى الآن</p></div></td></tr>`;
        return;
    }
    tbody.innerHTML = data.map((s, i) => `
        <tr>
            <td>${i + 1}</td>
            <td>${s.customers?.name || '—'}</td>
            <td>${formatMoney(s.total_amount)}</td>
            <td>${statusBadge(s.payment_status, { paid: 'مدفوع', unpaid: 'غير مدفوع', partial: 'جزئي' })}</td>
            <td>${formatDate(s.created_at)}</td>
            <td>
                <div class="action-btns">
                    <button class="btn-icon btn-edit" onclick="editSaleStatus('${s.id}', '${s.payment_status}')" title="تحديث الحالة">✏️</button>
                    <button class="btn-icon btn-delete" onclick="deleteSale('${s.id}')" title="حذف">🗑️</button>
                </div>
            </td>
        </tr>`).join('');
}

function filterSales() {
    const q      = (document.getElementById('salesSearch')?.value || '').toLowerCase();
    const status = document.getElementById('salesStatusFilter')?.value || '';
    const filtered = allSales.filter(s => {
        const matchQ = !q || (s.customers?.name || '').toLowerCase().includes(q);
        const matchS = !status || s.payment_status === status;
        return matchQ && matchS;
    });
    renderSales(filtered);
}

async function saveSale() {
    const user = await getCurrentUser();
    if (!user || !supabaseClient) return;

    const customer_id    = document.getElementById('sale_customer_id')?.value;
    const total_amount   = parseFloat(document.getElementById('sale_total')?.value || '0');
    const payment_status = document.getElementById('sale_payment_status')?.value || 'unpaid';
    const payment_method = document.getElementById('sale_payment_method')?.value || 'cash';
    const notes          = document.getElementById('sale_notes')?.value || '';

    if (!customer_id) { showToast('يرجى اختيار العميل', 'error'); return; }
    if (!total_amount || total_amount <= 0) { showToast('يرجى إدخال مبلغ صحيح', 'error'); return; }

    try {
        const saleNumber = 'SALE-' + Date.now();
        const { error } = await supabaseClient.from('sales').insert({
            user_id: user.id, customer_id, total_amount, payment_status, payment_method, notes, sale_number: saleNumber
        });
        if (error) throw error;
        showToast('تم إضافة عملية البيع بنجاح ✓', 'success');
        closeModal('addSaleModal');
        resetSaleForm();
        await loadSales();
        cacheSystem.clear(`dashboard_${user.id}`);
    } catch (err) {
        console.error('saveSale:', err);
        showToast('خطأ في إضافة عملية البيع: ' + err.message, 'error');
    }
}

function resetSaleForm() {
    ['sale_customer_id','sale_total','sale_notes'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    const ps = document.getElementById('sale_payment_status');
    if (ps) ps.value = 'unpaid';
}

async function editSaleStatus(id, currentStatus) {
    const newStatus = currentStatus === 'paid' ? 'unpaid' : currentStatus === 'unpaid' ? 'paid' : 'paid';
    try {
        const { error } = await supabaseClient.from('sales').update({ payment_status: newStatus }).eq('id', id);
        if (error) throw error;
        showToast('تم تحديث حالة الدفع ✓', 'success');
        await loadSales();
    } catch (err) {
        showToast('خطأ في التحديث', 'error');
    }
}

async function deleteSale(id) {
    confirmDelete('هل أنت متأكد من حذف عملية البيع هذه؟', async () => {
        try {
            const { error } = await supabaseClient.from('sales').delete().eq('id', id);
            if (error) throw error;
            showToast('تم حذف عملية البيع ✓', 'success');
            await loadSales();
        } catch (err) {
            showToast('خطأ في الحذف', 'error');
        }
    });
}

// =========================================================
// CUSTOMERS
// =========================================================
let allCustomers = [];

async function loadCustomers() {
    const user = await getCurrentUser();
    if (!user || !supabaseClient) return;
    try {
        const { data, error } = await supabaseClient
            .from('customers')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
        if (error) throw error;
        allCustomers = data || [];
        renderCustomers(allCustomers);
    } catch (err) {
        console.error('loadCustomers:', err);
        showToast('خطأ في تحميل العملاء', 'error');
    }
}

function renderCustomers(data) {
    const tbody = document.getElementById('customersTableBody');
    if (!tbody) return;
    if (!data || data.length === 0) {
        tbody.innerHTML = `<tr class="empty-state"><td colspan="6"><div class="empty-content"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg><p>لا يوجد عملاء حتى الآن</p></div></td></tr>`;
        return;
    }
    tbody.innerHTML = data.map(c => `
        <tr>
            <td><strong>${c.name}</strong></td>
            <td>${c.email || '—'}</td>
            <td>${c.phone || '—'}</td>
            <td>${c.city || '—'}</td>
            <td>${statusBadge(c.status, { active: 'نشط', inactive: 'غير نشط' })}</td>
            <td>
                <div class="action-btns">
                    <button class="btn-icon btn-edit" onclick="toggleCustomerStatus('${c.id}','${c.status}')" title="تبديل الحالة">🔄</button>
                    <button class="btn-icon btn-delete" onclick="deleteCustomer('${c.id}')" title="حذف">🗑️</button>
                </div>
            </td>
        </tr>`).join('');
}

function filterCustomers() {
    const q      = (document.getElementById('customerSearch')?.value || '').toLowerCase();
    const status = document.getElementById('customerStatusFilter')?.value || '';
    const filtered = allCustomers.filter(c => {
        const matchQ = !q || c.name.toLowerCase().includes(q) || (c.email || '').toLowerCase().includes(q) || (c.phone || '').includes(q);
        const matchS = !status || c.status === status;
        return matchQ && matchS;
    });
    renderCustomers(filtered);
}

async function saveCustomer() {
    const user = await getCurrentUser();
    if (!user || !supabaseClient) return;

    const name    = document.getElementById('cust_name')?.value.trim() || '';
    const email   = document.getElementById('cust_email')?.value.trim() || '';
    const phone   = document.getElementById('cust_phone')?.value.trim() || '';
    const city    = document.getElementById('cust_city')?.value.trim() || '';
    const country = document.getElementById('cust_country')?.value.trim() || '';
    const address = document.getElementById('cust_address')?.value.trim() || '';
    const notes   = document.getElementById('cust_notes')?.value.trim() || '';

    if (!name) { showToast('اسم العميل مطلوب', 'error'); return; }

    try {
        const { error } = await supabaseClient.from('customers').insert({
            user_id: user.id, name, email, phone, city, country, address, notes, status: 'active'
        });
        if (error) throw error;
        showToast('تم إضافة العميل بنجاح ✓', 'success');
        closeModal('addCustomerModal');
        resetCustomerForm();
        await loadCustomers();
        cacheSystem.clear(`dashboard_${user.id}`);
    } catch (err) {
        showToast('خطأ في إضافة العميل: ' + err.message, 'error');
    }
}

function resetCustomerForm() {
    ['cust_name','cust_email','cust_phone','cust_city','cust_country','cust_address','cust_notes'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
}

async function toggleCustomerStatus(id, currentStatus) {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
        const { error } = await supabaseClient.from('customers').update({ status: newStatus }).eq('id', id);
        if (error) throw error;
        showToast('تم تحديث حالة العميل ✓', 'success');
        await loadCustomers();
    } catch (err) {
        showToast('خطأ في التحديث', 'error');
    }
}

async function deleteCustomer(id) {
    confirmDelete('هل أنت متأكد من حذف هذا العميل؟ سيتم حذف جميع مبيعاته.', async () => {
        try {
            const { error } = await supabaseClient.from('customers').delete().eq('id', id);
            if (error) throw error;
            showToast('تم حذف العميل ✓', 'success');
            await loadCustomers();
        } catch (err) {
            showToast('خطأ في الحذف: ' + err.message, 'error');
        }
    });
}

// ── Populate customer dropdown ────────────────────────────
async function populateCustomerSelect(selectId) {
    const user = await getCurrentUser();
    if (!user || !supabaseClient) return;
    try {
        const { data, error } = await supabaseClient
            .from('customers')
            .select('id, name')
            .eq('user_id', user.id)
            .eq('status', 'active');
        if (error) throw error;
        const sel = document.getElementById(selectId);
        if (!sel) return;
        const current = sel.value;
        sel.innerHTML = '<option value="">-- اختر عميل --</option>' +
            (data || []).map(c => `<option value="${c.id}" ${c.id === current ? 'selected' : ''}>${c.name}</option>`).join('');
    } catch (err) {
        console.error('populateCustomerSelect:', err);
    }
}

// =========================================================
// INVENTORY (PRODUCTS)
// =========================================================
let allProducts = [];

async function loadProducts() {
    const user = await getCurrentUser();
    if (!user || !supabaseClient) return;
    try {
        const { data, error } = await supabaseClient
            .from('products')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
        if (error) throw error;
        allProducts = data || [];
        renderProducts(allProducts);
    } catch (err) {
        console.error('loadProducts:', err);
        showToast('خطأ في تحميل المنتجات', 'error');
    }
}

function renderProducts(data) {
    const tbody = document.getElementById('productsTableBody');
    if (!tbody) return;
    if (!data || data.length === 0) {
        tbody.innerHTML = `<tr class="empty-state"><td colspan="7"><div class="empty-content"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg><p>لا توجد منتجات حتى الآن</p></div></td></tr>`;
        return;
    }
    tbody.innerHTML = data.map(p => {
        const lowStock = p.quantity_in_stock <= (p.reorder_level || 10);
        const stockBadge = lowStock
            ? `<span class="badge badge-danger">${p.quantity_in_stock} ⚠️</span>`
            : `<span class="badge badge-success">${p.quantity_in_stock}</span>`;
        return `
        <tr>
            <td><strong>${p.name}</strong>${p.description ? `<br><small style="color:var(--text-light)">${p.description.substring(0,40)}...</small>` : ''}</td>
            <td>${p.sku || '—'}</td>
            <td>${formatMoney(p.price)}</td>
            <td>${p.cost ? formatMoney(p.cost) : '—'}</td>
            <td>${stockBadge}</td>
            <td>${p.category || '—'}</td>
            <td>
                <div class="action-btns">
                    <button class="btn-icon btn-edit" onclick="adjustStock('${p.id}', ${p.quantity_in_stock})" title="تعديل المخزون">📦</button>
                    <button class="btn-icon btn-delete" onclick="deleteProduct('${p.id}')" title="حذف">🗑️</button>
                </div>
            </td>
        </tr>`;
    }).join('');
}

function filterProducts() {
    const q        = (document.getElementById('productSearch')?.value || '').toLowerCase();
    const category = document.getElementById('productCategoryFilter')?.value || '';
    const filtered = allProducts.filter(p => {
        const matchQ = !q || p.name.toLowerCase().includes(q) || (p.sku || '').toLowerCase().includes(q);
        const matchC = !category || p.category === category;
        return matchQ && matchC;
    });
    renderProducts(filtered);
}

async function saveProduct() {
    const user = await getCurrentUser();
    if (!user || !supabaseClient) return;

    const name             = document.getElementById('prod_name')?.value.trim() || '';
    const price            = parseFloat(document.getElementById('prod_price')?.value || '0');
    const cost             = parseFloat(document.getElementById('prod_cost')?.value || '0') || null;
    const quantity_in_stock = parseInt(document.getElementById('prod_qty')?.value || '0');
    const reorder_level    = parseInt(document.getElementById('prod_reorder')?.value || '10');
    const sku              = document.getElementById('prod_sku')?.value.trim() || null;
    const category         = document.getElementById('prod_category')?.value || null;
    const description      = document.getElementById('prod_desc')?.value.trim() || null;

    if (!name) { showToast('اسم المنتج مطلوب', 'error'); return; }
    if (!price || price <= 0) { showToast('سعر صحيح مطلوب', 'error'); return; }

    try {
        const { error } = await supabaseClient.from('products').insert({
            user_id: user.id, name, price, cost, quantity_in_stock, reorder_level, sku, category, description, status: 'active'
        });
        if (error) throw error;
        showToast('تم إضافة المنتج بنجاح ✓', 'success');
        closeModal('addProductModal');
        resetProductForm();
        await loadProducts();
        cacheSystem.clear(`dashboard_${user.id}`);
    } catch (err) {
        showToast('خطأ في إضافة المنتج: ' + err.message, 'error');
    }
}

function resetProductForm() {
    ['prod_name','prod_price','prod_cost','prod_qty','prod_reorder','prod_sku','prod_desc'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    const cat = document.getElementById('prod_category');
    if (cat) cat.value = '';
}

async function adjustStock(id, currentQty) {
    const newQty = prompt(`الكمية الحالية: ${currentQty}\nأدخل الكمية الجديدة:`, currentQty);
    if (newQty === null || newQty === '') return;
    const qty = parseInt(newQty);
    if (isNaN(qty) || qty < 0) { showToast('كمية غير صحيحة', 'error'); return; }
    try {
        const { error } = await supabaseClient.from('products').update({ quantity_in_stock: qty }).eq('id', id);
        if (error) throw error;
        showToast('تم تحديث المخزون ✓', 'success');
        await loadProducts();
    } catch (err) {
        showToast('خطأ في تحديث المخزون', 'error');
    }
}

async function deleteProduct(id) {
    confirmDelete('هل أنت متأكد من حذف هذا المنتج؟', async () => {
        try {
            const { error } = await supabaseClient.from('products').delete().eq('id', id);
            if (error) throw error;
            showToast('تم حذف المنتج ✓', 'success');
            await loadProducts();
        } catch (err) {
            showToast('خطأ في الحذف: ' + err.message, 'error');
        }
    });
}

// =========================================================
// ACCOUNTING (EXPENSES)
// =========================================================
let allExpenses = [];

async function loadAccounting() {
    const user = await getCurrentUser();
    if (!user || !supabaseClient) return;
    try {
        const [salesRes, expensesRes] = await Promise.all([
            supabaseClient.from('sales').select('total_amount').eq('user_id', user.id),
            supabaseClient.from('expenses').select('*').eq('user_id', user.id).order('expense_date', { ascending: false })
        ]);

        const totalRevenue  = (salesRes.data || []).reduce((s, r) => s + Number(r.total_amount || 0), 0);
        allExpenses = expensesRes.data || [];
        const totalExpenses = allExpenses.reduce((s, r) => s + Number(r.amount || 0), 0);
        const netProfit     = totalRevenue - totalExpenses;

        setText('accTotalRevenue',  formatMoney(totalRevenue));
        setText('accTotalExpenses', formatMoney(totalExpenses));
        setText('accNetProfit',     formatMoney(netProfit));

        const netEl = document.getElementById('accNetProfit');
        if (netEl) netEl.style.color = netProfit >= 0 ? 'var(--success)' : 'var(--danger)';

        renderExpenses(allExpenses);

        // Set today's date
        const today = new Date().toISOString().split('T')[0];
        const expDate = document.getElementById('exp_date');
        if (expDate && !expDate.value) expDate.value = today;

    } catch (err) {
        console.error('loadAccounting:', err);
        showToast('خطأ في تحميل بيانات المحاسبة', 'error');
    }
}

function renderExpenses(data) {
    const tbody = document.getElementById('expensesTableBody');
    if (!tbody) return;
    if (!data || data.length === 0) {
        tbody.innerHTML = `<tr class="empty-state"><td colspan="6"><div class="empty-content"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 3v18"/></svg><p>لا توجد مصروفات حتى الآن</p></div></td></tr>`;
        return;
    }
    const paymentMethodAr = { cash: 'نقدي', bank_transfer: 'تحويل بنكي', credit_card: 'بطاقة ائتمان', check: 'شيك' };
    tbody.innerHTML = data.map(ex => `
        <tr>
            <td><span class="badge badge-secondary">${ex.category}</span></td>
            <td>${ex.description || ex.vendor_name || '—'}</td>
            <td><strong>${formatMoney(ex.amount)}</strong></td>
            <td>${formatDate(ex.expense_date)}</td>
            <td>${paymentMethodAr[ex.payment_method] || ex.payment_method || '—'}</td>
            <td>
                <div class="action-btns">
                    <button class="btn-icon btn-delete" onclick="deleteExpense('${ex.id}')" title="حذف">🗑️</button>
                </div>
            </td>
        </tr>`).join('');
}

async function saveExpense() {
    const user = await getCurrentUser();
    if (!user || !supabaseClient) return;

    const category       = document.getElementById('exp_category')?.value || '';
    const amount         = parseFloat(document.getElementById('exp_amount')?.value || '0');
    const expense_date   = document.getElementById('exp_date')?.value || '';
    const payment_method = document.getElementById('exp_payment_method')?.value || 'cash';
    const vendor_name    = document.getElementById('exp_vendor')?.value.trim() || '';
    const description    = document.getElementById('exp_description')?.value.trim() || '';

    if (!category) { showToast('يرجى اختيار فئة المصروف', 'error'); return; }
    if (!amount || amount <= 0) { showToast('يرجى إدخال مبلغ صحيح', 'error'); return; }
    if (!expense_date) { showToast('يرجى إدخال تاريخ المصروف', 'error'); return; }

    try {
        const { error } = await supabaseClient.from('expenses').insert({
            user_id: user.id, category, amount, expense_date, payment_method, vendor_name, description, status: 'approved'
        });
        if (error) throw error;
        showToast('تم إضافة المصروف بنجاح ✓', 'success');
        closeModal('addExpenseModal');
        resetExpenseForm();
        await loadAccounting();
    } catch (err) {
        showToast('خطأ في إضافة المصروف: ' + err.message, 'error');
    }
}

function resetExpenseForm() {
    ['exp_amount','exp_vendor','exp_description'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    const cat = document.getElementById('exp_category');
    if (cat) cat.value = '';
    const expDate = document.getElementById('exp_date');
    if (expDate) expDate.value = new Date().toISOString().split('T')[0];
}

async function deleteExpense(id) {
    confirmDelete('هل أنت متأكد من حذف هذا المصروف؟', async () => {
        try {
            const { error } = await supabaseClient.from('expenses').delete().eq('id', id);
            if (error) throw error;
            showToast('تم حذف المصروف ✓', 'success');
            await loadAccounting();
        } catch (err) {
            showToast('خطأ في الحذف', 'error');
        }
    });
}

// =========================================================
// HR (EMPLOYEES)
// =========================================================
async function loadEmployees() {
    const user = await getCurrentUser();
    if (!user || !supabaseClient) return;
    try {
        const { data, error } = await supabaseClient
            .from('employees')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
        if (error) throw error;
        renderEmployees(data || []);
    } catch (err) {
        console.error('loadEmployees:', err);
        showToast('خطأ في تحميل بيانات الموظفين', 'error');
    }
}

function renderEmployees(data) {
    const tbody = document.getElementById('employeesTableBody');
    if (!tbody) return;
    if (!data || data.length === 0) {
        tbody.innerHTML = `<tr class="empty-state"><td colspan="7"><div class="empty-content"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M12 7v14"/></svg><p>لا يوجد موظفون حتى الآن</p></div></td></tr>`;
        return;
    }
    tbody.innerHTML = data.map(e => `
        <tr>
            <td><strong>${e.name}</strong>${e.email ? `<br><small style="color:var(--text-light)">${e.email}</small>` : ''}</td>
            <td>${e.position || '—'}</td>
            <td>${e.department || '—'}</td>
            <td>${e.salary ? formatMoney(e.salary) : '—'}</td>
            <td>${formatDate(e.hire_date)}</td>
            <td>${statusBadge(e.status, { active: 'نشط', inactive: 'غير نشط' })}</td>
            <td>
                <div class="action-btns">
                    <button class="btn-icon btn-edit" onclick="toggleEmployeeStatus('${e.id}','${e.status}')" title="تبديل الحالة">🔄</button>
                    <button class="btn-icon btn-delete" onclick="deleteEmployee('${e.id}')" title="حذف">🗑️</button>
                </div>
            </td>
        </tr>`).join('');
}

async function saveEmployee() {
    const user = await getCurrentUser();
    if (!user || !supabaseClient) return;

    const name       = document.getElementById('emp_name')?.value.trim() || '';
    const email      = document.getElementById('emp_email')?.value.trim() || '';
    const phone      = document.getElementById('emp_phone')?.value.trim() || '';
    const position   = document.getElementById('emp_position')?.value.trim() || '';
    const department = document.getElementById('emp_department')?.value.trim() || '';
    const salary     = parseFloat(document.getElementById('emp_salary')?.value || '0') || null;
    const hire_date  = document.getElementById('emp_hire_date')?.value || null;

    if (!name) { showToast('اسم الموظف مطلوب', 'error'); return; }

    try {
        const { error } = await supabaseClient.from('employees').insert({
            user_id: user.id, name, email, phone, position, department, salary, hire_date, status: 'active'
        });
        if (error) throw error;
        showToast('تم إضافة الموظف بنجاح ✓', 'success');
        closeModal('addEmployeeModal');
        resetEmployeeForm();
        await loadEmployees();
    } catch (err) {
        showToast('خطأ في إضافة الموظف: ' + err.message, 'error');
    }
}

function resetEmployeeForm() {
    ['emp_name','emp_email','emp_phone','emp_position','emp_department','emp_salary','emp_hire_date'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
}

async function toggleEmployeeStatus(id, currentStatus) {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
        const { error } = await supabaseClient.from('employees').update({ status: newStatus }).eq('id', id);
        if (error) throw error;
        showToast('تم تحديث حالة الموظف ✓', 'success');
        await loadEmployees();
    } catch (err) {
        showToast('خطأ في التحديث', 'error');
    }
}

async function deleteEmployee(id) {
    confirmDelete('هل أنت متأكد من حذف بيانات هذا الموظف؟', async () => {
        try {
            const { error } = await supabaseClient.from('employees').delete().eq('id', id);
            if (error) throw error;
            showToast('تم حذف الموظف ✓', 'success');
            await loadEmployees();
        } catch (err) {
            showToast('خطأ في الحذف', 'error');
        }
    });
}

// =========================================================
// SETTINGS
// =========================================================
async function loadSettings() {
    const user = await getCurrentUser();
    if (!user || !supabaseClient) return;
    try {
        const { data, error } = await supabaseClient.from('profiles').select('*').eq('id', user.id).single();
        if (error) throw error;
        if (!data) return;
        const fields = { set_business_name: 'business_name', set_phone: 'phone', set_industry: 'industry', set_city: 'city', set_country: 'country', set_currency: 'currency' };
        Object.entries(fields).forEach(([elId, field]) => {
            const el = document.getElementById(elId);
            if (el && data[field]) el.value = data[field];
        });
    } catch (err) {
        console.error('loadSettings:', err);
    }
}

async function saveSettings() {
    const user = await getCurrentUser();
    if (!user || !supabaseClient) return;
    const updates = {
        business_name: document.getElementById('set_business_name')?.value.trim() || '',
        phone:         document.getElementById('set_phone')?.value.trim() || '',
        industry:      document.getElementById('set_industry')?.value.trim() || '',
        city:          document.getElementById('set_city')?.value.trim() || '',
        country:       document.getElementById('set_country')?.value.trim() || '',
        currency:      document.getElementById('set_currency')?.value || 'EGP',
    };
    if (!updates.business_name) { showToast('الاسم التجاري مطلوب', 'error'); return; }
    try {
        const { error } = await supabaseClient.from('profiles').update(updates).eq('id', user.id);
        if (error) throw error;
        cacheSystem.clearAll();
        showToast('تم حفظ الإعدادات بنجاح ✓', 'success');
        setText('userName', updates.business_name);
        setText('userInitial', updates.business_name.charAt(0).toUpperCase());
    } catch (err) {
        showToast('خطأ في حفظ الإعدادات: ' + err.message, 'error');
    }
}