# 📚 دليل إعداد منصة بيزنس برو

## 🚀 البدء السريع

هذا الدليل يساعدك على إعداد منصة ERP متكاملة باستخدام HTML + CSS + JavaScript + Supabase.

---

## 1️⃣ إعداد Supabase

### الخطوة 1: إنشاء حساب Supabase
1. اذهب إلى [supabase.com](https://supabase.com)
2. اضغط على "Start your project"
3. سجل الدخول أو أنشئ حساب جديد

### الخطوة 2: إنشاء مشروع جديد
1. اضغط "New Project"
2. اختر اسم المشروع: `businesspro`
3. اختر كلمة مرور قوية للـ Database
4. اختر المنطقة (يفضل الأقرب إليك)
5. اضغط "Create new project"

### الخطوة 3: الحصول على المفاتيح
1. اذهب إلى **Settings** → **API**
2. انسخ هذه القيم:
   - **Project URL** (SUPABASE_URL)
   - **anon public key** (SUPABASE_ANON_KEY)

### الخطوة 4: تحديث الملف script.js
افتح `script.js` واستبدل هذه الأسطر:

```javascript
const SUPABASE_URL = 'YOUR-SUPABASE-URL-HERE';
const SUPABASE_ANON_KEY = 'YOUR-ANON-KEY-HERE';
```

---

## 2️⃣ إنشاء الجداول (Tables)

اتبع هذه الخطوات في لوحة تحكم Supabase:

### الجدول 1: profiles (ملفات الشركات)

```sql
-- 1. انسخ هذا الكود
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  subdomain TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. تفعيل RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 3. أنشئ سياسة للقراءة
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- 4. أنشئ سياسة للكتابة
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- 5. أنشئ سياسة للإدراج
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
```

### الجدول 2: customers (العملاء)

```sql
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own customers"
  ON customers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own customers"
  ON customers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own customers"
  ON customers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own customers"
  ON customers FOR DELETE
  USING (auth.uid() = user_id);
```

### الجدول 3: products (المنتجات)

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  cost DECIMAL(10, 2),
  stock INTEGER DEFAULT 0,
  sku TEXT UNIQUE,
  category TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own products"
  ON products FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own products"
  ON products FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own products"
  ON products FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own products"
  ON products FOR DELETE
  USING (auth.uid() = user_id);
```

### الجدول 4: sales (المبيعات)

```sql
CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  quantity INTEGER DEFAULT 1,
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'completed',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own sales"
  ON sales FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sales"
  ON sales FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sales"
  ON sales FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sales"
  ON sales FOR DELETE
  USING (auth.uid() = user_id);
```

### الجدول 5: invoices (الفواتير)

```sql
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL UNIQUE,
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'draft',
  due_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own invoices"
  ON invoices FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own invoices"
  ON invoices FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own invoices"
  ON invoices FOR UPDATE
  USING (auth.uid() = user_id);
```

---

## 3️⃣ إدراج البيانات التجريبية

لاختبار المنصة، أدرج بيانات وهمية:

```sql
-- مثال: إدراج عميل (بعد التسجيل)
INSERT INTO customers (user_id, name, email, phone, city)
VALUES (
  'YOUR-USER-ID',
  'أحمد محمد',
  'ahmed@example.com',
  '+201001234567',
  'القاهرة'
);

-- مثال: إدراج منتج
INSERT INTO products (user_id, name, price, cost, stock, category)
VALUES (
  'YOUR-USER-ID',
  'منتج تجريبي',
  1500.00,
  800.00,
  50,
  'الفئة الأولى'
);

-- مثال: إدراج عملية بيع
INSERT INTO sales (user_id, customer_id, product_id, quantity, amount)
VALUES (
  'YOUR-USER-ID',
  'CUSTOMER-ID',
  'PRODUCT-ID',
  2,
  3000.00
);
```

---

## 4️⃣ إعدادات الأمان

### تفعيل Email Verification
1. اذهب إلى **Authentication** → **Providers** → **Email**
2. فعّل "Confirm email"
3. عدّل رسالة البريد الإلكتروني

### تفعيل CORS
1. اذهب إلى **Settings** → **API** → **CORS**
2. أضف نطاقك: `http://localhost:3000` (للتطوير)
3. وأضف النطاق الفعلي لاحقاً

### تفعيل Auth Redirect URLs
1. اذهب إلى **Authentication** → **URL Configuration**
2. أضف Redirect URLs:
   - `http://localhost:3000/dashboard.html`
   - `YOUR-DOMAIN.com/dashboard.html`

---

## 5️⃣ تشغيل المنصة محليًا

### الخطوة 1: تنصيب خادم محلي
استخدم أي من هذه الخيارات:

**خيار 1: Python (سهل)**
```bash
cd your-project-folder
python -m http.server 3000
```

**خيار 2: Node.js**
```bash
npm install -g http-server
cd your-project-folder
http-server -p 3000
```

**خيار 3: VS Code Live Server**
- اضغط على ملف HTML بزر يمين
- اختر "Open with Live Server"

### الخطوة 2: الوصول إلى المنصة
افتح المتصفح وادخل:
```
http://localhost:3000
```

---

## 6️⃣ اختبار المنصة

### اختبار التسجيل
1. اضغط "ابدأ مجانًا"
2. أدخل البيانات:
   - الاسم التجاري: "شركة تجريبية"
   - البريد: "test@example.com"
   - كلمة المرور: "Test1234"
   - النطاق الفرعي: "testcompany"
3. اضغط "ابدأ الاستخدام مجانًا"

### اختبار تسجيل الدخول
1. استخدم نفس البريد وكلمة المرور
2. يجب أن تنتقل إلى لوحة التحكم

### اختبار لوحة التحكم
1. يجب أن ترى الإحصائيات
2. جرب تبديل الأقسام من الشريط الجانبي
3. اختبر تسجيل الخروج

---

## 7️⃣ نصائح للإنتاج

### استضافة المشروع

**خيار 1: Vercel (مجاني)**
1. ادفع الملفات إلى GitHub
2. اذهب إلى [vercel.com](https://vercel.com)
3. اضغط "New Project"
4. اختر مستودع GitHub
5. Deploy

**خيار 2: Netlify (مجاني)**
1. ادفع إلى GitHub
2. اذهب إلى [netlify.com](https://netlify.com)
3. اختر "New site from Git"
4. اتبع الخطوات

**خيار 3: Heroku (مدفوع)**
1. استخدم Heroku CLI
2. ادفع الملفات
3. Deploy

### تحسينات الأمان
- استخدم HTTPS في الإنتاج
- لا تكشف مفاتيح Supabase في الكود
- استخدم متغيرات البيئة (.env)
- فعّل حماية CSRF
- استخدم Content Security Policy

### تحسينات الأداء
- استخدم صور محسّنة
- فعّل التخزين المؤقت (Caching)
- استخدم CDN لتقديم الملفات
- قلل حجم CSS و JavaScript

---

## 8️⃣ استكشاف الأخطاء

### خطأ: "createClient is not defined"
✅ تأكد من تضمين مكتبة Supabase في HTML:
```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```

### خطأ: "Invalid API key"
✅ تحقق من المفاتيح في `script.js`

### خطأ: CORS
✅ أضف نطاقك في Supabase Settings → API → CORS

### البيانات لا تظهر في الداشبورد
✅ تأكد من:
1. وجود بيانات في قاعدة البيانات
2. تفعيل RLS بشكل صحيح
3. تسجيل الدخول بنفس الحساب

---

## 9️⃣ تطوير إضافي

### إضافة المزيد من الميزات:

#### 1. نظام الفواتير
```javascript
async function createInvoice(customerId, amount) {
  const invoiceNumber = `INV-${Date.now()}`;
  await supabase.from('invoices').insert([{
    user_id: currentUser.id,
    customer_id: customerId,
    invoice_number: invoiceNumber,
    amount
  }]);
}
```

#### 2. تقارير مالية
```javascript
async function getMonthlyReport() {
  const { data } = await supabase
    .from('sales')
    .select('amount, created_at')
    .eq('user_id', currentUser.id)
    .gte('created_at', monthStart);
  
  return calculateTotals(data);
}
```

#### 3. إدارة المستخدمين
```javascript
async function addTeamMember(email) {
  const { data } = await supabase.auth.admin.createUser({
    email,
    password: generatePassword()
  });
}
```

#### 4. التنبيهات
```javascript
async function setupAlerts() {
  supabase
    .from('products')
    .on('*', payload => {
      if (payload.new.stock < 10) {
        showAlert('تحذير: المخزون منخفض!');
      }
    })
    .subscribe();
}
```

---

## 🔟 الدعم والمساعدة

### مصادر مفيدة:
- [وثائق Supabase](https://supabase.com/docs)
- [MDN Web Docs](https://developer.mozilla.org)
- [Stack Overflow](https://stackoverflow.com)

### اتصل بنا:
- البريد: support@businesspro.com
- الهاتف: +966 (مثال)
- وسائل التواصل الاجتماعية

---

## ملاحظات مهمة:

⚠️ **قبل الإطلاق:**
1. اختبر جميع الوظائف
2. تأكد من أمان البيانات
3. احصل على شهادة SSL
4. احتفظ بنسخة احتياطية من البيانات
5. راجع سياسة الخصوصية والشروط

---

**تم إنشاء هذا الدليل بواسطة فريق بيزنس برو**
**آخر تحديث: 2024**
