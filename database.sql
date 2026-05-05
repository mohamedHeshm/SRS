-- ========================================
-- منصة بيزنس برو - إعداد قاعدة البيانات
-- ========================================
-- انسخ كل هذا الكود والصقه في SQL Editor في Supabase
-- ثم اضغط على "Run"

-- ========================================
-- الجدول 1: PROFILES (ملفات الشركات)
-- ========================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  subdomain TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  website TEXT,
  industry TEXT,
  employees_count INTEGER,
  country TEXT,
  city TEXT,
  address TEXT,
  postal_code TEXT,
  tax_id TEXT,
  currency TEXT DEFAULT 'SAR',
  language TEXT DEFAULT 'ar',
  timezone TEXT DEFAULT 'Asia/Riyadh',
  status TEXT DEFAULT 'active',
  subscription_plan TEXT DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- تفعيل RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان للجدول profiles
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ========================================
-- الجدول 2: CUSTOMERS (العملاء)
-- ========================================

CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  country TEXT,
  postal_code TEXT,
  tax_id TEXT,
  customer_type TEXT DEFAULT 'individual',
  credit_limit DECIMAL(12, 2),
  payment_terms TEXT,
  notes TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- تفعيل RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان للجدول customers
CREATE POLICY "Users can read own customers"
  ON customers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own customers"
  ON customers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own customers"
  ON customers FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own customers"
  ON customers FOR DELETE
  USING (auth.uid() = user_id);

-- الفهرس لتحسين الأداء
CREATE INDEX IF NOT EXISTS customers_user_id_idx ON customers(user_id);
CREATE INDEX IF NOT EXISTS customers_email_idx ON customers(email);

-- ========================================
-- الجدول 3: PRODUCTS (المنتجات)
-- ========================================

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  sku TEXT,
  barcode TEXT,
  price DECIMAL(12, 2) NOT NULL,
  cost DECIMAL(12, 2),
  quantity_in_stock INTEGER DEFAULT 0,
  reorder_level INTEGER DEFAULT 10,
  category TEXT,
  subcategory TEXT,
  unit TEXT DEFAULT 'piece',
  tax_rate DECIMAL(5, 2) DEFAULT 0,
  is_taxable BOOLEAN DEFAULT TRUE,
  image_url TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- تفعيل RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان للجدول products
CREATE POLICY "Users can read own products"
  ON products FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own products"
  ON products FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own products"
  ON products FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own products"
  ON products FOR DELETE
  USING (auth.uid() = user_id);

-- الفهارس
CREATE INDEX IF NOT EXISTS products_user_id_idx ON products(user_id);
CREATE INDEX IF NOT EXISTS products_sku_idx ON products(sku);
CREATE INDEX IF NOT EXISTS products_category_idx ON products(category);

-- ========================================
-- الجدول 4: SALES (المبيعات)
-- ========================================

CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  sale_number TEXT UNIQUE,
  subtotal DECIMAL(12, 2) DEFAULT 0,
  tax_amount DECIMAL(12, 2) DEFAULT 0,
  total_amount DECIMAL(12, 2) NOT NULL,
  discount_percent DECIMAL(5, 2) DEFAULT 0,
  discount_amount DECIMAL(12, 2) DEFAULT 0,
  payment_status TEXT DEFAULT 'unpaid',
  payment_method TEXT,
  delivery_status TEXT DEFAULT 'pending',
  notes TEXT,
  due_date DATE,
  shipped_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- تفعيل RLS
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان للجدول sales
CREATE POLICY "Users can read own sales"
  ON sales FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sales"
  ON sales FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sales"
  ON sales FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own sales"
  ON sales FOR DELETE
  USING (auth.uid() = user_id);

-- الفهارس
CREATE INDEX IF NOT EXISTS sales_user_id_idx ON sales(user_id);
CREATE INDEX IF NOT EXISTS sales_customer_id_idx ON sales(customer_id);
CREATE INDEX IF NOT EXISTS sales_created_at_idx ON sales(created_at);

-- ========================================
-- الجدول 5: SALE_ITEMS (تفاصيل المبيعات)
-- ========================================

CREATE TABLE IF NOT EXISTS sale_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(12, 2) NOT NULL,
  line_total DECIMAL(12, 2) NOT NULL,
  discount_percent DECIMAL(5, 2) DEFAULT 0,
  tax_amount DECIMAL(12, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- تفعيل RLS
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان
CREATE POLICY "Users can read own sale items"
  ON sale_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM sales WHERE sales.id = sale_items.sale_id AND sales.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own sale items"
  ON sale_items FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM sales WHERE sales.id = sale_items.sale_id AND sales.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own sale items"
  ON sale_items FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM sales WHERE sales.id = sale_items.sale_id AND sales.user_id = auth.uid()
  ));

-- الفهارس
CREATE INDEX IF NOT EXISTS sale_items_sale_id_idx ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS sale_items_product_id_idx ON sale_items(product_id);

-- ========================================
-- الجدول 6: INVOICES (الفواتير)
-- ========================================

CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  sale_id UUID REFERENCES sales(id) ON DELETE SET NULL,
  invoice_number TEXT NOT NULL UNIQUE,
  subtotal DECIMAL(12, 2) DEFAULT 0,
  tax_amount DECIMAL(12, 2) DEFAULT 0,
  total_amount DECIMAL(12, 2) NOT NULL,
  amount_paid DECIMAL(12, 2) DEFAULT 0,
  balance_due DECIMAL(12, 2) DEFAULT 0,
  status TEXT DEFAULT 'draft',
  payment_status TEXT DEFAULT 'unpaid',
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  paid_date DATE,
  notes TEXT,
  terms TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- تفعيل RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان
CREATE POLICY "Users can read own invoices"
  ON invoices FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own invoices"
  ON invoices FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own invoices"
  ON invoices FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- الفهارس
CREATE INDEX IF NOT EXISTS invoices_user_id_idx ON invoices(user_id);
CREATE INDEX IF NOT EXISTS invoices_customer_id_idx ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS invoices_status_idx ON invoices(status);

-- ========================================
-- الجدول 7: EXPENSES (المصروفات)
-- ========================================

CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  description TEXT,
  amount DECIMAL(12, 2) NOT NULL,
  expense_date DATE NOT NULL,
  payment_method TEXT,
  vendor_name TEXT,
  receipt_url TEXT,
  status TEXT DEFAULT 'approved',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- تفعيل RLS
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان
CREATE POLICY "Users can read own expenses"
  ON expenses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own expenses"
  ON expenses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expenses"
  ON expenses FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- الفهارس
CREATE INDEX IF NOT EXISTS expenses_user_id_idx ON expenses(user_id);
CREATE INDEX IF NOT EXISTS expenses_category_idx ON expenses(category);
CREATE INDEX IF NOT EXISTS expenses_date_idx ON expenses(expense_date);

-- ========================================
-- الجدول 8: EMPLOYEES (الموظفون)
-- ========================================

CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  position TEXT,
  department TEXT,
  salary DECIMAL(12, 2),
  hire_date DATE,
  status TEXT DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- تفعيل RLS
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان
CREATE POLICY "Users can read own employees"
  ON employees FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own employees"
  ON employees FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own employees"
  ON employees FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- الفهارس
CREATE INDEX IF NOT EXISTS employees_user_id_idx ON employees(user_id);

-- ========================================
-- الجدول 9: ACTIVITY_LOG (سجل النشاطات)
-- ========================================

CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  description TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- تفعيل RLS
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان
CREATE POLICY "Users can read own activity log"
  ON activity_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activity log"
  ON activity_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- الفهارس
CREATE INDEX IF NOT EXISTS activity_log_user_id_idx ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS activity_log_created_at_idx ON activity_log(created_at);

-- ========================================
-- بيانات تجريبية (اختيارية)
-- ========================================

-- إذا كنت تريد بيانات تجريبية، قم بإلغاء التعليق عن الأسطر التالية
-- تذكر: استبدل 'YOUR-USER-ID' بـ ID المستخدم الفعلي

/*
-- إضافة عملاء تجريبيين
INSERT INTO customers (user_id, name, email, phone, city, status)
VALUES
  ('YOUR-USER-ID', 'أحمد محمد', 'ahmed@example.com', '+201001234567', 'القاهرة', 'active'),
  ('YOUR-USER-ID', 'فاطمة علي', 'fatima@example.com', '+201102345678', 'الإسكندرية', 'active'),
  ('YOUR-USER-ID', 'محمود حسن', 'mahmoud@example.com', '+201203456789', 'جيزة', 'active');

-- إضافة منتجات تجريبية
INSERT INTO products (user_id, name, price, cost, quantity_in_stock, category, sku)
VALUES
  ('YOUR-USER-ID', 'منتج تجريبي 1', 1500.00, 800.00, 50, 'الإلكترونيات', 'SKU001'),
  ('YOUR-USER-ID', 'منتج تجريبي 2', 2500.00, 1200.00, 30, 'الملابس', 'SKU002'),
  ('YOUR-USER-ID', 'منتج تجريبي 3', 500.00, 250.00, 100, 'الأثاث', 'SKU003');

-- إضافة عملية بيع تجريبية
INSERT INTO sales (user_id, customer_id, total_amount, sale_number)
VALUES
  ('YOUR-USER-ID', 'CUSTOMER-ID-1', 3000.00, 'SALE-001'),
  ('YOUR-USER-ID', 'CUSTOMER-ID-2', 5000.00, 'SALE-002');
*/

-- ========================================
-- التحقق من الجداول المنشأة
-- ========================================
-- استخدم هذا الاستعلام للتحقق من أن جميع الجداول تم إنشاؤها بنجاح

SELECT 
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- تم! جميع الجداول جاهزة للاستخدام 🎉
