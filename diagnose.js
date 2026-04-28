#!/usr/bin/env node

/**
 * Diagnostic Tool for Educational Telegram Bot
 * Tests all configurations and helps troubleshoot issues
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

console.log('\n╔════════════════════════════════════════════════════════╗');
console.log('║  🔍 Educational Telegram Bot - Diagnostic Tool         ║');
console.log('╚════════════════════════════════════════════════════════╝\n');

// Color helpers
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

const check = (condition, label) => {
  const icon = condition ? `${colors.green}✅${colors.reset}` : `${colors.red}❌${colors.reset}`;
  console.log(`${icon} ${label}`);
  return condition;
};

const warning = (label) => {
  console.log(`${colors.yellow}⚠️${colors.reset}  ${label}`);
};

const info = (label) => {
  console.log(`${colors.cyan}ℹ️${colors.reset}  ${label}`);
};

// Test results
const results = {
  nodejs: false,
  dependencies: false,
  envFile: false,
  envVars: {},
  mongodb: false,
  cloudinary: false,
  projectFiles: false
};

console.log(`${colors.cyan}[1/6] Node.js Environment${colors.reset}\n`);

// Check Node.js version
const nodeVersion = process.version;
const [major] = nodeVersion.split('.')[0].substring(1).split('.');
results.nodejs = parseInt(major) >= 18;
check(results.nodejs, `Node.js version: ${nodeVersion} (required: v18+)`);
console.log();

console.log(`${colors.cyan}[2/6] Dependencies${colors.reset}\n`);

// Check npm packages
const packageJsonPath = path.join(__dirname, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = require(packageJsonPath);
  const required = ['telegraf', 'mongoose', 'cloudinary', 'dotenv'];
  const nodeModulesPath = path.join(__dirname, 'node_modules');
  
  const allInstalled = required.every(pkg => {
    const exists = fs.existsSync(path.join(nodeModulesPath, pkg));
    check(exists, `${pkg}: ${packageJson.dependencies[pkg] || 'unknown'}`);
    return exists;
  });
  
  results.dependencies = allInstalled;
} else {
  warning('package.json not found');
}
console.log();

console.log(`${colors.cyan}[3/6] Environment Variables${colors.reset}\n`);

// Check .env file
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  check(false, '.env file exists');
  warning('Create .env file from .env.example');
} else {
  check(true, '.env file exists');
  
  // Check each variable
  const required = {
    'TELEGRAM_BOT_TOKEN': 'Telegram Bot Token',
    'MONGODB_URI': 'MongoDB Connection String',
    'CLOUDINARY_CLOUD_NAME': 'Cloudinary Cloud Name',
    'CLOUDINARY_API_KEY': 'Cloudinary API Key',
    'CLOUDINARY_API_SECRET': 'Cloudinary API Secret',
    'ADMIN_IDS': 'Admin Telegram IDs'
  };
  
  const envContent = fs.readFileSync(envPath, 'utf-8');
  let allConfigured = true;
  
  console.log();
  for (const [key, label] of Object.entries(required)) {
    const hasValue = envContent.includes(`${key}=`) && 
                    !envContent.split(`${key}=`)[1].startsWith('your_') &&
                    !envContent.split(`${key}=`)[1].startsWith('example');
    
    const value = process.env[key];
    results.envVars[key] = hasValue;
    
    if (hasValue && value) {
      check(true, `${label}: configured`);
    } else {
      check(false, `${label}: ${value ? 'empty' : 'missing'}`);
      allConfigured = false;
    }
  }
  
  results.envFile = allConfigured;
}
console.log();

console.log(`${colors.cyan}[4/6] MongoDB${colors.reset}\n`);

// Check MongoDB
const mongoUri = process.env.MONGODB_URI;
if (mongoUri) {
  if (mongoUri.includes('localhost:27017')) {
    check(true, `MongoDB URI: local (${mongoUri})`);
    info('Make sure MongoDB is running locally');
    info('Check: mongosh --host localhost:27017');
  } else if (mongoUri.includes('mongodb+srv')) {
    check(true, `MongoDB URI: MongoDB Atlas (cloud)`);
    info('Connection string configured for cloud');
  } else {
    check(true, `MongoDB URI: configured (${mongoUri})`);
  }
  results.mongodb = true;
} else {
  check(false, 'MongoDB URI: not configured');
}
console.log();

console.log(`${colors.cyan}[5/6] Cloudinary${colors.reset}\n`);

// Check Cloudinary
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

check(!!cloudName, `Cloud Name: ${cloudName ? '✓ configured' : '✗ missing'}`);
check(!!apiKey, `API Key: ${apiKey ? '✓ configured' : '✗ missing'}`);
check(!!apiSecret, `API Secret: ${apiSecret ? '✓ configured' : '✗ missing'}`);

if (cloudName && apiKey && apiSecret) {
  results.cloudinary = true;
  console.log();
  info('Verify at: https://cloudinary.com/console');
} else {
  console.log();
  warning('Some Cloudinary credentials are missing');
}
console.log();

console.log(`${colors.cyan}[6/6] Project Structure${colors.reset}\n`);

// Check project files
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
  check(exists, `${file}`);
  if (!exists) allFilesExist = false;
}

results.projectFiles = allFilesExist;
console.log();

// Summary
console.log('╔════════════════════════════════════════════════════════╗');
console.log('║  📋 Summary                                            ║');
console.log('╚════════════════════════════════════════════════════════╝\n');

const passed = Object.values(results).filter(v => v === true).length;
const total = Object.keys(results).length;

console.log(`Overall: ${passed}/${total} checks passed\n`);

if (results.nodejs) console.log(`${colors.green}✓${colors.reset} Node.js compatible`);
if (results.dependencies) console.log(`${colors.green}✓${colors.reset} All dependencies installed`);
if (results.envFile) console.log(`${colors.green}✓${colors.reset} Environment variables configured`);
if (results.mongodb) console.log(`${colors.green}✓${colors.reset} MongoDB configured`);
if (results.cloudinary) console.log(`${colors.green}✓${colors.reset} Cloudinary configured`);
if (results.projectFiles) console.log(`${colors.green}✓${colors.reset} Project files complete`);

console.log();

// Recommendations
if (!results.envFile) {
  console.log(`${colors.yellow}❌ ACTION REQUIRED: Configure environment variables${colors.reset}`);
  console.log('   Copy .env.example to .env');
  console.log('   Fill in your credentials:');
  
  for (const [key, label] of Object.entries({
    'TELEGRAM_BOT_TOKEN': 'From @BotFather',
    'MONGODB_URI': 'Local: mongodb://localhost:27017/BotData',
    'CLOUDINARY_CLOUD_NAME': 'From cloudinary.com/console',
    'CLOUDINARY_API_KEY': 'From cloudinary.com/console',
    'CLOUDINARY_API_SECRET': 'From cloudinary.com/console',
    'ADMIN_IDS': 'Your Telegram user ID from @userinfobot'
  })) {
    if (!results.envVars[key]) {
      console.log(`     • ${key}: ${label}`);
    }
  }
  console.log();
}

if (!results.dependencies) {
  console.log(`${colors.yellow}❌ ACTION REQUIRED: Install dependencies${colors.reset}`);
  console.log('   Run: npm install\n');
}

if (results.nodejs && results.dependencies && results.envFile) {
  console.log(`${colors.green}✅ READY TO START${colors.reset}\n`);
  console.log('Before running the bot:');
  console.log('  1. Start MongoDB (if using local):');
  console.log('     • Windows: Start "MongoDB Server" from Services');
  console.log('     • Mac: brew services start mongodb-community');
  console.log('     • Linux: sudo systemctl start mongodb');
  console.log();
  console.log('  2. Verify MongoDB is running:');
  console.log('     mongosh --host localhost:27017');
  console.log();
  console.log('  3. Start the bot:');
  console.log('     npm start');
  console.log();
}

console.log('📚 For more help, see:');
console.log('   • QUICKSTART.md - Quick start guide');
console.log('   • GETTING_STARTED.md - Step-by-step setup');
console.log('   • README.md - Full documentation');
console.log();
