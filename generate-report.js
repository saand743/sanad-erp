const fs = require('fs');
const path = require('path');
const execSync = require('child_process').execSync;

// دالة لاستعراض المجلدات والملفات
function listFiles(dirPath) {
  const files = fs.readdirSync(dirPath);
  let result = [];

  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    const stats = fs.statSync(fullPath);
    
    if (stats.isDirectory()) {
      result.push({
        type: 'folder',
        name: file,
        contents: listFiles(fullPath),
      });
    } else {
      result.push({
        type: 'file',
        name: file,
        path: fullPath,
      });
    }
  });

  return result;
}

// دالة لإنشاء تقرير شامل
function generateReport() {
  const projectPath = 'H:/possss';  // تعديل هنا لضمان المسار صحيح
  
  const systemContents = listFiles(projectPath);  // استعراض المجلدات والملفات
  
  const features = [
    "نظام محاسبة كامل متكامل",
    "نظام مخازن كامل متكامل",
    "نظام مبيعات كامل متكامل",
    "نظام إدارة المتاجر",
    "واجهة مستخدم مرنة وعصرية",
    "دعم لتصدير التقارير بصيغ مختلفة مثل PDF و Excel",
    "دعم تكامل مع منصات مثل Shopify و WooCommerce",
    "أنظمة أمان متقدمة باستخدام JWT و bcrypt"
  ];
  
  const languages = [
    "JavaScript (Node.js)",
    "React.js",
    "Next.js",
    "HTML/CSS",
    "PostgreSQL",
    "Prettier, ESLint"
  ];
  
  const database = [
    "جدول المستخدمين",
    "جدول الفواتير",
    "جدول المنتجات",
    "جدول المبيعات",
    "جدول التراخيص",
    "جدول المخزون"
  ];
  
  const unnecessaryFiles = [
    "ملفات الـ test القديمة",
    "ملفات الـ log"
  ];
  
  const report = `
    تقرير المشروع:
    
    1. **محتويات النظام:**
    ${JSON.stringify(systemContents, null, 2)}
    
    2. **المميزات والخصائص:**
    - ${features.join('\n- ')}

    3. **قاعدة البيانات:**
    - ${database.join('\n- ')}

    4. **البرمجة واللغات المستخدمة:**
    - ${languages.join('\n- ')}

    5. **الملفات المستخدمة في المشروع:**
    ${JSON.stringify(systemContents, null, 2)}

    6. **الملفات التي قد تكون غير ضرورية:**
    - ${unnecessaryFiles.join('\n- ')}
  `;

  fs.writeFileSync('project_report.txt', report, 'utf8');
  console.log('تم إنشاء تقرير المشروع بنجاح!');
}

// تشغيل السكربت
generateReport();
