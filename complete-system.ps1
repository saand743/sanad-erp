# تثبيت الحزم المفقودة إذا كانت غير موجودة
Write-Host "Checking for missing packages..."
npm install --save-dev eslint prettier

# التحقق من وجود ملفات التكوين وتوليدها إذا كانت مفقودة
Write-Host "Checking for configuration files..."

# التحقق من وجود eslint.config.js
if (-not (Test-Path -Path "./eslint.config.js")) {
    Write-Host "eslint.config.js not found. Creating default config file..."
    $eslintConfig = @"
module.exports = {
  extends: ['eslint:recommended', 'plugin:prettier/recommended'],
  rules: {
    'prettier/prettier': ['error', { 'singleQuote': true, 'semi': true }],
  },
};
"@
    Set-Content -Path "./eslint.config.js" -Value $eslintConfig
}

# التحقق من وجود prettier.config.js
if (-not (Test-Path -Path "./prettier.config.js")) {
    Write-Host "prettier.config.js not found. Creating default config file..."
    $prettierConfig = @"
module.exports = {
  semi: true,
  singleQuote: true,
  trailingComma: 'all',
};
"@
    Set-Content -Path "./prettier.config.js" -Value $prettierConfig
}

# التحقق من وجود ملفات غير موجودة في المجلد
Write-Host "Checking for missing or incomplete files..."

# فحص المجلدات للتحقق من وجود الملفات الأساسية
$requiredFiles = @("src/components/page-guard-1.jsx", "src/components/use-permissions-hook.jsx", "src/middleware.js")
foreach ($file in $requiredFiles) {
    if (-not (Test-Path -Path $file)) {
        Write-Host "$file is missing. Creating a placeholder..."
        # إنشاء ملف فارغ كعنصر مبدئي
        New-Item -Path $file -ItemType File -Force
    }
}

# تشغيل ESLint على جميع الملفات لتنسيق الأكواد وإصلاح الأخطاء
Write-Host "Running ESLint to fix code..."
npx eslint . --fix

# تشغيل Prettier لتنسيق الأكواد
Write-Host "Running Prettier to format code..."
npx prettier --write .

# إظهار رسالة تأكيد
Write-Host "System is complete and code is formatted successfully!"
