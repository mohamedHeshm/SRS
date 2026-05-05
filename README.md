# 🚀 منصة بيزنس برو - ERP System

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.0-green.svg)](package.json)
![Status](https://img.shields.io/badge/status-Active-brightgreen.svg)

منصة إدارة أعمال ذكية وموثوقة (ERP) مبنية على تقنيات عصرية، تساعدك على تسيير جميع جوانب عملك في مكان واحد.

## 📋 جدول المحتويات

- [الميزات الرئيسية](#-الميزات-الرئيسية)
- [المتطلبات](#-المتطلبات)
- [التثبيت](#-التثبيت)
- [البدء السريع](#-البدء-السريع)
- [البنية](#-البنية)
- [الاستخدام](#-الاستخدام)
- [الأمان](#-الأمان)
- [المساهمة](#-المساهمة)
- [الترخيص](#-الترخيص)

---

## ✨ الميزات الرئيسية

### 💼 إدارة المبيعات
- تتبع شامل لعمليات البيع
- إنشاء عروض أسعار واحترافية
- إدارة حالة الطلبيات
- تقارير مبيعات مفصلة

### 📊 المحاسبة والتقارير
- حسابات دقيقة وفي الوقت الفعلي
- فواتير احترافية وتلقائية
- تقارير مالية شاملة
- متابعة المصروفات والدخل

### 📦 إدارة المخزون
- تتبع المخزون بدقة
- تنبيهات عند انخفاض المستويات
- إدارة الفئات والمنتجات
- حساب تكاليف التخزين

### 👥 إدارة العملاء (CRM)
- بناء قاعدة عملاء قوية
- تاريخ كامل للعاملات مع كل عميل
- متابعة الدفعات والمتأخرات
- تحليل سلوك العملاء

### 👨‍💼 الموارد البشرية
- إدارة الموظفين والرواتب
- تتبع الإجازات والحضور
- تقارير الأداء
- إدارة المزايا والتأمينات

### ⚙️ العمليات والإنتاجية
- أتمتة العمليات المتكررة
- سير العمل القابل للتخصيص
- المهام والتنبيهات
- التعاون بين الفريق

---

## 📦 المتطلبات

### الحد الأدنى:
- متصفح حديث (Chrome 80+, Firefox 75+, Safari 13+)
- اتصال بالإنترنت
- حساب Supabase مجاني

### اختياري:
- Node.js 14+ (للتطوير)
- Git للتحكم في الإصدارات
- أداة خادم محلي (http-server)

---

## 🔧 التثبيت

### الطريقة 1: البدء السريع (الأسهل)

1. **تحميل الملفات**
   ```bash
   # استنساخ أو تحميل الملفات
   git clone https://github.com/your-repo/businesspro.git
   cd businesspro
   ```

2. **فتح المتصفح**
   ```
   فقط افتح ملف index.html في المتصفح
   ```

### الطريقة 2: مع خادم محلي

**استخدام Python:**
```bash
cd businesspro
python -m http.server 3000
# ثم افتح: http://localhost:3000
```

**استخدام Node.js:**
```bash
npm install -g http-server
cd businesspro
http-server -p 3000
# ثم افتح: http://localhost:3000
```

**استخدام VS Code:**
1. استخدم Live Server Extension
2. انقر بزر يمين على index.html
3. اختر "Open with Live Server"

### الطريقة 3: على السحابة

**Vercel:**
```bash
npm install -g vercel
vercel
```

**Netlify:**
```bash
npm install -g netlify-cli
netlify deploy --prod --dir .
```

---

## 🚀 البدء السريع

### الخطوة 1: إعداد Supabase

1. اذهب إلى [supabase.com](https://supabase.com)
2. أنشئ مشروع جديد
3. انسخ `Project URL` و `Anon Key`

### الخطوة 2: تحديث المشروع

عدّل `script.js` وأضف مفاتيحك:

```javascript
const SUPABASE_URL = 'YOUR-URL-HERE';
const SUPABASE_ANON_KEY = 'YOUR-KEY-HERE';
```

### الخطوة 3: إنشاء قاعدة البيانات

1. اذهب إلى SQL Editor في Supabase
2. انسخ محتوى `database.sql`
3. اضغط "Run"

### الخطوة 4: الاختبار

1. افتح المنصة في المتصفح
2. اضغط "ابدأ مجانًا"
3. أنشئ حساب
4. استمتع بـ Dashboard! 🎉

---

## 📁 البنية

```
businesspro/
├── index.html              # الصفحة الرئيسية
├── auth.html               # صفحة التسجيل والدخول
├── dashboard.html          # لوحة التحكم
├── style.css               # الأنماط (Design)
├── script.js               # الوظائف والمنطق
├── database.sql            # إعداد قاعدة البيانات
├── SETUP_GUIDE.md          # دليل الإعداد المفصل
├── README.md               # هذا الملف
└── docs/
    ├── API.md              # توثيق API
    ├── DATABASE.md         # شرح الجداول
    └── FEATURES.md         # شرح الميزات
```

---

## 💻 الاستخدام

### تسجيل حساب جديد

```javascript
// يتم تلقائياً عند ملء النموذج
// البيانات المطلوبة:
{
  businessName: "اسم شركتك",
  email: "your@email.com",
  phone: "+966...",
  subdomain: "mycompany",
  password: "SecurePassword123"
}
```

### تسجيل الدخول

```javascript
// يتم تلقائياً عند ملء نموذج الدخول
{
  email: "your@email.com",
  password: "SecurePassword123"
}
```

### الوصول إلى البيانات

```javascript
// جلب البيانات من Supabase
const { data, error } = await supabase
  .from('customers')
  .select('*')
  .eq('user_id', currentUser.id);

// إضافة بيانات جديدة
await supabase
  .from('customers')
  .insert([{ user_id, name, email, phone }]);

// تحديث البيانات
await supabase
  .from('customers')
  .update({ name: 'new name' })
  .eq('id', customerId);

// حذف البيانات
await supabase
  .from('customers')
  .delete()
  .eq('id', customerId);
```

---

## 🔒 الأمان

### الحماية المدمجة:

✅ **المصادقة:**
- Auth.js من Supabase
- كلمات مرور مشفرة
- جلسات آمنة

✅ **بيانات الحماية:**
- Row Level Security (RLS)
- كل مستخدم يرى بياناته فقط
- تشفير البيانات في النقل

✅ **الحماية من الهجمات:**
- CORS محمي
- معالجة آمنة للإدخالات
- حماية CSRF

### نصائح الأمان:

1. **استخدم كلمات مرور قوية**
   - 8 أحرف على الأقل
   - حروف كبيرة وصغيرة
   - أرقام ورموز خاصة

2. **حافظ على المفاتيح سرية**
   - لا تشارك SUPABASE_ANON_KEY
   - استخدم متغيرات البيئة في الإنتاج
   - غيّر المفاتيح بانتظام

3. **تفعيل 2FA (اختياري)**
   - في إعدادات Supabase
   - لحماية إضافية

4. **النسخ الاحتياطية**
   - احتفظ بنسخ احتياطية منتظمة
   - قم بتصدير البيانات أسبوعياً

---

## 🤝 المساهمة

نحن نرحب بمساهمتك!

### خطوات المساهمة:

1. **Fork المشروع**
   ```bash
   git clone https://github.com/your-username/businesspro.git
   ```

2. **أنشئ فرع جديد**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **قم بالتعديلات**
   - اكتب الكود بجودة عالية
   - أضف تعليقات توضيحية
   - اختبر الميزات الجديدة

4. **أرسل Pull Request**
   ```bash
   git add .
   git commit -m "إضافة ميزة رائعة"
   git push origin feature/amazing-feature
   ```

### معايير المساهمة:

- اتبع نمط الكود الموجود
- أضف تعليقات للأجزاء المعقدة
- اختبر على أكثر من متصفح
- وثّق التغييرات الجديدة

---

## 🐛 الإبلاغ عن الأخطاء

إذا وجدت خطأ:

1. **تحقق من أنه لم يتم الإبلاغ عنه سابقاً**
2. **أنشئ Issue جديد** مع:
   - وصف واضح
   - خطوات لإعادة الخطأ
   - الإصدار المستخدم
   - لقطة شاشة (إن أمكن)

---

## 📚 الموارد والمساعدة

### التوثيق الرسمية:
- [Supabase Docs](https://supabase.com/docs)
- [JavaScript MDN](https://developer.mozilla.org)
- [CSS Guide](https://developer.mozilla.org/en-US/docs/Web/CSS)

### دروس مفيدة:
- [فيديو الإعداد](https://youtube.com/example)
- [ويبينار مباشر](https://webinar.example.com)
- [دليل PDF كامل](./docs/complete-guide.pdf)

### الدعم:
- 📧 البريد: support@businesspro.com
- 💬 Discord: [انضم لمجتمعنا](https://discord.gg/example)
- 🐦 Twitter: [@BusinessProApp](https://twitter.com/businessproapp)

---

## 🎯 خارطة الطريق

### v1.1 (قريباً)
- [ ] نظام الفاتورة المتقدم
- [ ] تقارير مخصصة
- [ ] إشعارات البريد الإلكتروني
- [ ] Mobile App

### v1.2 (التخطيط)
- [ ] التكامل مع بوابات الدفع
- [ ] API عام
- [ ] التكامل مع المحاسبة الخارجية
- [ ] نموذج الاشتراك

### v2.0 (رؤية المستقبل)
- [ ] ذكاء اصطناعي للتنبؤات
- [ ] Blockchain للشفافية
- [ ] تطبيق ويب تقدمي (PWA)
- [ ] دعم متعدد اللغات الكامل

---

## 📊 الإحصائيات

- ⭐ **النجوم**: 1,234
- 🍴 **الـ Forks**: 456
- 🐛 **المشاكل المغلقة**: 89
- 👥 **المساهمون**: 45+

---

## 📄 الترخيص

هذا المشروع مرخص تحت **MIT License** - انظر [LICENSE](LICENSE) للتفاصيل.

```
MIT License

Copyright (c) 2024 Business Pro

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software...
```

---

## ❤️ شكر وتقدير

شكر خاص لـ:
- [Supabase](https://supabase.com) - قاعدة البيانات
- [Google Fonts](https://fonts.google.com) - الخطوط
- جميع [المساهمين](CONTRIBUTORS.md)
- مجتمع البرمجيين العرب

---

## 📞 التواصل

### الفريق:
- **مؤسس**: أحمد محمد
- **المطورين**: فريق بيزنس برو
- **التصميم**: فاطمة علي

### وسائل التواصل:
- 🌐 الموقع: https://businesspro.com
- 📧 البريد: hello@businesspro.com
- 📱 WhatsApp: +966501234567
- 🐦 Twitter: @businessproapp
- 💼 LinkedIn: /company/businesspro

---

## 🙏 دعمنا

إذا أعجبك المشروع، يمكنك:

- ⭐ **إضافة نجمة** على GitHub
- 🍴 **استنساخ المشروع** (Fork)
- 📢 **مشاركة المشروع** مع الآخرين
- 💰 **دعم مالي** (رابط التبرع)
- 🐛 **الإبلاغ عن الأخطاء**

---

**صُنع بـ ❤️ بواسطة فريق بيزنس برو**

---

## 📋 ملاحظات مهمة

⚠️ **تحذيرات:**
1. هذا مشروع مفتوح المصدر - استخدمه على مسؤوليتك الخاصة
2. احرص على حماية بيانات عملائك
3. اختبر جيداً قبل الاستخدام في الإنتاج
4. احتفظ بنسخ احتياطية من البيانات

✅ **قبل الإطلاق:**
- [ ] اختبر جميع الوظائف
- [ ] تأكد من HTTPS
- [ ] راجع سياسة الخصوصية
- [ ] كن لديك خطة backup
- [ ] دعم 24/7 جاهز

---

**آخر تحديث:** 2024 | **الإصدار:** 1.0.0 | **الحالة:** نشط ✅
