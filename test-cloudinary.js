require('dotenv').config();
const path = require('path');

console.log('📂 المسار الحالي:', process.cwd());
console.log('📂 مسار ملف .env:', path.resolve('.env'));

// اطبع كل المتغيرات للتأكد
console.log('\n🔍 ما يتم قراءته من .env:');
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME || '❌ غير موجود');
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? '✅ موجود' : '❌ غير موجود');
console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '✅ موجود' : '❌ غير موجود');

// إذا كان فارغاً، اقرأ الملف يدوياً
const fs = require('fs');
if (!process.env.CLOUDINARY_CLOUD_NAME) {
  console.log('\n⚠️  محاولة قراءة الملف يدوياً...');
  try {
    const envContent = fs.readFileSync('.env', 'utf-8');
    const line = envContent.split('\n').find(l => l.includes('CLOUDINARY_CLOUD_NAME'));
    console.log('السطر الموجود:', line);
  } catch (e) {
    console.log('❌ لم يتم العثور على الملف:', e.message);
  }
}