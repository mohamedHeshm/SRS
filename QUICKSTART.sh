#!/usr/bin/env bash

# ========================================
# منصة بيزنس برو - دليل البدء السريع
# ========================================

echo "🚀 مرحباً بك في منصة بيزنس برو!"
echo "=================================="
echo ""

# ========================================
# الخطوة 1: التحقق من المتطلبات
# ========================================

echo "✅ الخطوة 1: التحقق من المتطلبات"
echo "-----------------------------------"

# التحقق من وجود Node.js (اختياري)
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo "✓ Node.js $NODE_VERSION مثبت"
else
    echo "ℹ️  Node.js غير مثبت (اختياري - للتطوير فقط)"
fi

# التحقق من وجود Git (اختياري)
if command -v git &> /dev/null; then
    echo "✓ Git مثبت"
else
    echo "ℹ️  Git غير مثبت (اختياري)"
fi

echo ""

# ========================================
# الخطوة 2: إعداد Supabase
# ========================================

echo "✅ الخطوة 2: إعداد Supabase"
echo "-----------------------------------"
echo ""
echo "اتبع هذه الخطوات:"
echo "1. اذهب إلى https://supabase.com"
echo "2. أنشئ حساب جديد"
echo "3. أنشئ مشروع جديد"
echo "4. اذهب إلى Settings → API"
echo "5. انسخ:"
echo "   - Project URL"
echo "   - Anon Key"
echo ""
read -p "👉 هل أكملت إعداد Supabase؟ (نعم/لا): " SUPABASE_READY

if [ "$SUPABASE_READY" != "نعم" ] && [ "$SUPABASE_READY" != "yes" ]; then
    echo "⚠️  يرجى إعداد Supabase أولاً"
    exit 1
fi

echo ""

# ========================================
# الخطوة 3: تحديث الملفات
# ========================================

echo "✅ الخطوة 3: تحديث الملفات"
echo "-----------------------------------"

# فحص وجود script.js
if [ ! -f "script.js" ]; then
    echo "⚠️  لم يتم العثور على script.js"
    exit 1
fi

echo "ℹ️  يجب تحديث script.js بـ مفاتيح Supabase الخاصة بك"
echo ""
echo "ابتح script.js وعدّل هذا الجزء:"
echo ""
echo "const SUPABASE_URL = 'https://your-project.supabase.co';"
echo "const SUPABASE_ANON_KEY = 'your-anon-key';"
echo ""
echo "ادخل القيم من Supabase:"
echo ""

read -p "📋 أدخل SUPABASE_URL: " SUPABASE_URL
read -p "📋 أدخل SUPABASE_ANON_KEY: " SUPABASE_ANON_KEY

# تحديث script.js
if [ -n "$SUPABASE_URL" ] && [ -n "$SUPABASE_ANON_KEY" ]; then
    sed -i "s|const SUPABASE_URL = '.*'|const SUPABASE_URL = '$SUPABASE_URL'|g" script.js
    sed -i "s|const SUPABASE_ANON_KEY = '.*'|const SUPABASE_ANON_KEY = '$SUPABASE_ANON_KEY'|g" script.js
    echo "✅ تم تحديث script.js بنجاح"
else
    echo "⚠️  لم يتم إدخال القيم"
fi

echo ""

# ========================================
# الخطوة 4: إنشاء قاعدة البيانات
# ========================================

echo "✅ الخطوة 4: إنشاء قاعدة البيانات"
echo "-----------------------------------"
echo ""
echo "ستحتاج إلى نسخ ولصق محتوى database.sql في Supabase SQL Editor"
echo ""
echo "الخطوات:"
echo "1. اذهب إلى Supabase Dashboard"
echo "2. اضغط على SQL Editor"
echo "3. اضغط على 'New Query'"
echo "4. انسخ محتوى database.sql"
echo "5. الصقها في المربع"
echo "6. اضغط 'Run'"
echo ""

read -p "👉 هل أكملت إنشاء قاعدة البيانات؟ (نعم/لا): " DB_READY

if [ "$DB_READY" != "نعم" ] && [ "$DB_READY" != "yes" ]; then
    echo "⚠️  يرجى إنشاء قاعدة البيانات أولاً"
    exit 1
fi

echo ""

# ========================================
# الخطوة 5: تشغيل المشروع
# ========================================

echo "✅ الخطوة 5: تشغيل المشروع"
echo "-----------------------------------"
echo ""
echo "اختر طريقة التشغيل:"
echo "1. Python (أسهل)"
echo "2. Node.js"
echo "3. VS Code Live Server"
echo "4. يدويًا"
echo ""

read -p "📋 اختر الخيار (1-4): " CHOICE

case $CHOICE in
    1)
        echo "🐍 تشغيل خادم Python..."
        echo ""
        echo "الأمر:"
        echo "python -m http.server 3000"
        echo ""
        echo "ثم افتح المتصفح:"
        echo "http://localhost:3000"
        ;;
    2)
        echo "📦 تشغيل خادم Node.js..."
        echo ""
        echo "الأمر:"
        echo "npm install -g http-server"
        echo "http-server -p 3000"
        echo ""
        echo "ثم افتح المتصفح:"
        echo "http://localhost:3000"
        ;;
    3)
        echo "💻 استخدام VS Code Live Server..."
        echo ""
        echo "الخطوات:"
        echo "1. استخدم Live Server Extension"
        echo "2. انقر بزر يمين على index.html"
        echo "3. اختر 'Open with Live Server'"
        ;;
    4)
        echo "🖱️  التشغيل اليدوي..."
        echo ""
        echo "فقط افتح index.html مباشرة في المتصفح"
        ;;
esac

echo ""

# ========================================
# الخطوة 6: الاختبار
# ========================================

echo "✅ الخطوة 6: الاختبار"
echo "-----------------------------------"
echo ""
echo "بعد فتح المنصة، جرّب هذا:"
echo ""
echo "1. اضغط 'ابدأ مجانًا'"
echo "2. ملأ البيانات:"
echo "   - الاسم التجاري: شركة تجريبية"
echo "   - البريد: test@example.com"
echo "   - الهاتف: +201001234567"
echo "   - النطاق الفرعي: testcompany"
echo "   - كلمة المرور: Test1234"
echo "3. اضغط 'ابدأ الاستخدام مجانًا'"
echo "4. يجب أن تنتقل لـ Dashboard"
echo ""

# ========================================
# الخطوة 7: الدعم والموارد
# ========================================

echo "✅ الخطوة 7: الدعم والموارد"
echo "-----------------------------------"
echo ""
echo "للمساعدة والمعلومات الإضافية:"
echo ""
echo "📚 الوثائق:"
echo "   - README.md - شامل"
echo "   - SETUP_GUIDE.md - تفصيلي"
echo "   - database.sql - جداول القاعدة"
echo ""
echo "🔗 الروابط المفيدة:"
echo "   - Supabase: https://supabase.com/docs"
echo "   - MDN: https://developer.mozilla.org"
echo "   - GitHub: https://github.com"
echo ""
echo "💬 التواصل:"
echo "   - البريد: support@businesspro.com"
echo "   - Twitter: @businessproapp"
echo "   - Discord: [رابط المجتمع]"
echo ""

# ========================================
# النهاية
# ========================================

echo "🎉 تم التهيئة بنجاح!"
echo "=================================="
echo ""
echo "✨ استمتع بـ منصة بيزنس برو!"
echo ""
echo "اضغط Enter للخروج..."
read

exit 0
