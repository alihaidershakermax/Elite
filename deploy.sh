#!/bin/bash

echo "🚀 بدء عملية النشر..."

# نشر Backend
echo "📦 نشر Backend..."
cd backend
vercel --prod
cd ..

# بناء تطبيق الويب
echo "🌐 بناء 