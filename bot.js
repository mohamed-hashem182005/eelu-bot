/**
 * EELU IT Material Bot
 * Created by Mohamed Hashem Gamae
 * Production with Express + Webhook
 */

require('dotenv').config();
const express = require('express');
const { Telegraf, session } = require('telegraf');

const { connectDB, disconnectDB } = require('./config/db');
const { testConnection: testCloudinary } = require('./config/cloudinary');
const { handleStart, handleHelp, handleReset, extractUserData } = require('./handlers/startHandler');
const { registerFlowHandlers } = require('./handlers/flowHandler');
const { registerAdminHandlers } = require('./handlers/adminHandler');
const userService = require('./services/userService');
const materialService = require('./services/materialService');

// Initialize Express app
const app = express();
app.use(express.json());

// Initialize bot
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

bot.use(session({
  defaultSession: () => ({ uploadState: null })
}));

// ✅ Register user data extraction middleware (runs on all messages/interactions)
bot.use(extractUserData);

// Register all handlers
const initBot = async () => {
  handleStart(bot);
  handleHelp(bot);
  handleReset(bot);
  registerFlowHandlers(bot);
  registerAdminHandlers(bot);
  console.log('✅ All handlers registered');
};

// Validate environment
const validateEnv = () => {
  const required = [
    'TELEGRAM_BOT_TOKEN',
    'MONGODB_URI',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
    'ADMIN_IDS',
    'WEBHOOK_URL'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    console.error('❌ Missing:', missing.join(', '));
    process.exit(1);
  }
  console.log('✅ Environment OK');
};

// Start server
const start = async () => {
  try {
    console.log('========================================');
    console.log('🎓 EELU IT Material Bot');
    console.log('👨‍💻 Created by Mohamed Hashem Gamae');
    console.log('🌐 Express + Webhook Mode');
    console.log('========================================\n');
    
    validateEnv();
    await connectDB();
    await testCloudinary();
    await initBot();
    
    // Webhook setup
    const WEBHOOK_URL = process.env.WEBHOOK_URL;
    const PORT = process.env.PORT || 3000;
    const webhookPath = '/webhook';
    
    // Set webhook on Telegram
    await bot.telegram.setWebhook(`${WEBHOOK_URL}${webhookPath}`);
    console.log(`✅ Webhook set: ${WEBHOOK_URL}${webhookPath}`);
    
    // Express route for webhook
    app.use(bot.webhookCallback(webhookPath));
    
    // Health check route (Render needs this)
    app.get('/', (req, res) => {
      res.json({
        status: 'online',
        bot: 'EELU IT Material Bot',
        creator: 'Mohamed Hashem Gamae',
        timestamp: new Date().toISOString()
      });
    });
    
    // Health check for Render
    app.get('/health', (req, res) => {
      res.json({ status: 'healthy', uptime: process.uptime() });
    });
    
    // Start Express server
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`\n🚀 Server running on port ${PORT}`);
      console.log(`📡 Webhook: ${WEBHOOK_URL}${webhookPath}`);
      console.log('✅ Bot is ready!\n');
    });
    
    // Graceful shutdown
    process.once('SIGINT', () => shutdown('SIGINT'));
    process.once('SIGTERM', () => shutdown('SIGTERM'));
    
  } catch (error) {
    console.error('❌ Failed to start:', error);
    process.exit(1);
  }
};

const shutdown = async (signal) => {
  console.log(`\n🛑 ${signal} received, shutting down...`);
  await bot.telegram.deleteWebhook();
  await disconnectDB();
  process.exit(0);
};

if (require.main === module) {
  start();
}

module.exports = { app, bot, start };