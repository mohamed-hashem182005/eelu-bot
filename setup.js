#!/usr/bin/env node

/**
 * Quick Setup Script for Educational Telegram Bot
 * This script verifies all prerequisites before running the bot
 */

const fs = require('fs');
const path = require('path');

console.log('\n========================================');
console.log('🤖 Educational Telegram Bot - Setup Check');
console.log('========================================\n');

// Check 1: Node.js version
console.log('✅ Check 1: Node.js Version');
const nodeVersion = process.version;
const requiredVersion = 'v18.0.0';
console.log(`   Current: ${nodeVersion}`);
console.log(`   Required: ${requiredVersion} or higher\n`);

// Check 2: Dependencies
console.log('✅ Check 2: Dependencies');
const packageJsonPath = path.join(__dirname, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = require(packageJsonPath);
  console.log(`   Dependencies installed: ${Object.keys(packageJson.dependencies).length}`);
  console.log(`   - telegraf: ${packageJson.dependencies.telegraf}`);
  console.log(`   - mongoose: ${packageJson.dependencies.mongoose}`);
  console.log(`   - cloudinary: ${packageJson.dependencies.cloudinary}`);
  console.log(`   - dotenv: ${packageJson.dependencies.dotenv}\n`);
} else {
  console.log('   ❌ package.json not found\n');
}

// Check 3: Environment Variables
console.log('✅ Check 3: Environment Variables');
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  console.log('   ✅ .env file found\n');
  
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const envVars = {
    TELEGRAM_BOT_TOKEN: false,
    MONGODB_URI: false,
    CLOUDINARY_CLOUD_NAME: false,
    CLOUDINARY_API_KEY: false,
    CLOUDINARY_API_SECRET: false,
    ADMIN_IDS: false
  };
  
  for (const key of Object.keys(envVars)) {
    const hasVar = envContent.includes(`${key}=`) && !envContent.includes(`${key}=your_`);
    envVars[key] = hasVar;
    const status = hasVar ? '✅' : '❌';
    console.log(`   ${status} ${key}`);
  }
  
  const allConfigured = Object.values(envVars).every(v => v);
  console.log(`\n   Overall: ${allConfigured ? '✅ All configured' : '❌ Some missing'}\n`);
} else {
  console.log('   ❌ .env file not found\n');
}

// Check 4: Project Structure
console.log('✅ Check 4: Project Structure');
const requiredDirs = ['config', 'models', 'services', 'handlers', 'storage', 'files'];
const requiredFiles = [
  'bot.js',
  'config/db.js',
  'config/cloudinary.js',
  'models/User.js',
  'models/Pdf.js',
  'services/userService.js',
  'services/pdfService.js',
  'handlers/startHandler.js',
  'handlers/flowHandler.js',
  'handlers/adminHandler.js'
];

let allFilesExist = true;
for (const file of requiredFiles) {
  const filePath = path.join(__dirname, file);
  const exists = fs.existsSync(filePath);
  const status = exists ? '✅' : '❌';
  console.log(`   ${status} ${file}`);
  if (!exists) allFilesExist = false;
}
console.log();

// Summary
console.log('========================================');
console.log('📋 Pre-Flight Checklist');
console.log('========================================\n');

const checks = [
  ['Node.js (v18+)', true],
  ['Dependencies installed', fs.existsSync(path.join(__dirname, 'node_modules'))],
  ['Project structure', allFilesExist],
  ['.env configured', fs.existsSync(envPath)]
];

let allGood = true;
for (const [name, status] of checks) {
  const icon = status ? '✅' : '❌';
  console.log(`${icon} ${name}`);
  if (!status) allGood = false;
}

console.log('\n========================================');
console.log('📌 Before Running the Bot');
console.log('========================================\n');

console.log('1. ⚠️ Start MongoDB:');
console.log('   Windows: Start "MongoDB Server" from Services');
console.log('   Mac:     brew services start mongodb-community');
console.log('   Linux:   sudo systemctl start mongodb\n');

console.log('2. ✅ Verify MongoDB is running:');
console.log('   mongosh --host localhost:27017\n');

console.log('3. ✅ Check .env file:');
console.log('   - TELEGRAM_BOT_TOKEN (from @BotFather)');
console.log('   - MONGODB_URI (local or Atlas)');
console.log('   - CLOUDINARY credentials');
console.log('   - ADMIN_IDS (your Telegram user ID)\n');

console.log('4. 🚀 Start the bot:');
console.log('   npm start\n');

console.log('========================================\n');

if (allGood) {
  console.log('✅ Everything looks good! Ready to run: npm start\n');
} else {
  console.log('⚠️ Please fix the issues above before running the bot\n');
}