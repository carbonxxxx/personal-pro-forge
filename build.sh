#!/bin/bash

echo "🚀 بدء عملية البناء للإنتاج..."

# Install dependencies
echo "📦 تثبيت الحزم..."
npm install

# Build for production
echo "🔨 بناء المشروع..."
npm run build

# Create additional files for hosting
echo "📄 إنشاء ملفات الاستضافة..."

# Copy .htaccess to dist
cp public/.htaccess dist/.htaccess

# Copy web.config to dist  
cp public/web.config dist/web.config

# Copy _redirects to dist
cp _redirects dist/_redirects

echo "✅ تم إنجاز البناء بنجاح!"
echo "📁 ملفات الإنتاج متوفرة في مجلد dist/"
echo "🌐 يمكنك الآن رفع محتويات مجلد dist/ إلى الاستضافة"