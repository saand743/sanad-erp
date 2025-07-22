# تثبيت الأدوات إذا لم تكن مثبتة
Write-Host "Installing required tools..."
npm install --save-dev eslint prettier

# تشغيل ESLint لتنسيق الكود وإصلاح الأخطاء
Write-Host "Running ESLint to fix errors..."
npx eslint . --fix

# تشغيل Prettier لتنسيق الكود
Write-Host "Running Prettier to format code..."
npx prettier --write .

# التأكد من تنسيق ملفات JSON و JSX
Write-Host "Checking file formatting..."

# فحص ملفات JSON و JSX وتحويلها إلى تنسيق صحيح
$files = Get-ChildItem -Recurse -File -Include "*.json", "*.jsx"
foreach ($file in $files) {
    try {
        Write-Host "Fixing file: $($file.FullName)"
        # إذا كان الملف JSON، نقوم بتنسيقه بشكل يدوي
        if ($file.Extension -eq ".json") {
            $content = Get-Content $file.FullName | Out-String
            $formattedContent = $content | ConvertFrom-Json | ConvertTo-Json -Compress
            Set-Content $file.FullName -Value $formattedContent
        }
        # إذا كان الملف JSX، نقوم بتنسيقه باستخدام Prettier
        elseif ($file.Extension -eq ".jsx") {
            npx prettier --write $file.FullName
        }
    }
    catch {
        Write-Host "Failed to fix file: $($file.FullName)"
    }
}

Write-Host "Files have been fixed successfully!"
