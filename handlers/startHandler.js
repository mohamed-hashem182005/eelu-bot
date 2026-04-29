const { Markup } = require('telegraf');
const userService = require('../services/userService');

// Bot signature
const SIGNATURE = '\n\n— اللهم صلي علي النبي';

const isAdmin = (userId) => {
  if (!userId || typeof userId !== 'number') return false;
  
  const adminIds = process.env.ADMIN_IDS
    ?.split(',')
    .map(id => parseInt(id.trim(), 10))
    .filter(id => !isNaN(id)) || [];
  
  return adminIds.includes(userId);
};

const adminMiddleware = async (ctx, next) => {
  const userId = ctx.from?.id;
  
  if (!isAdmin(userId)) {
    console.warn(`Unauthorized access attempt: user_id=${userId}`);
    return ctx.reply(withSignature('You are not authorized to use this command.'));
  }
  
  return next();
};

const withSignature = (text) => text + SIGNATURE;

// ✅ Welcome message for new users
const getWelcomeMessage = (firstName) => {
  return `🎓 Welcome to EELU IT Material Bot, ${firstName}!

📚 This bot provides study materials for IT students at EELU.

🎯 What you can do:
• Access lectures or sections and other(like:Revision or Quizes)
• Browse by level, semester, and subject

👨‍💻 Created by: Mohamed Hashem (Alsolamy)

🚀 Let's get started!`;
};

const handleStart = (bot) => {
  bot.command('start', async (ctx) => {
    const userId = ctx.from.id;
    const firstName = ctx.from.first_name || 'Student';
    
    // Create or get user
    await userService.getOrCreateUser(userId);
    await userService.updateUserSelection(userId, { 
      level: null,
      semester: null,
      subject: null,
      flowState: 'selecting-level' 
    });
    
    // Send welcome message first
    await ctx.reply(withSignature(getWelcomeMessage(firstName)));
    
    // Then show level selection
    ctx.reply(withSignature(
      'Please select your college level:'
    ), Markup.inlineKeyboard([
      [Markup.button.callback('First Year', 'level_first')],
      [Markup.button.callback('Second Year', 'level_second')],
      [Markup.button.callback('Third Year', 'level_third')],
      [Markup.button.callback('Fourth Year', 'level_fourth')]
    ]));
  });
};

const handleHelp = (bot) => {
  bot.command('help', async (ctx) => {
    const userId = ctx.from.id;
    const admin = isAdmin(userId);
    
    let message = '📚 Available Commands\n\n';
    
    if (admin) {
      message += '🔐 Admin Commands:\n';
      message += '/admin - Control Panel\n';
      message += '/upload - Upload Material\n';
      message += '/listpdfs - List all materials\n';
      message += '/deletepdf - Delete a material\n\n';
    }
    
    message += '👤 User Commands:\n';
    message += '/start - Begin material selection\n';
    message += '/reset - Clear selections\n';
    message += '/help - Show this message\n\n';
    
    if (admin) {
      message += '⭐ You are logged in as Admin';
    }
    
    ctx.reply(withSignature(message));
  });
};

const handleReset = (bot) => {
  bot.command('reset', async (ctx) => {
    const userId = ctx.from.id;
    await userService.resetUser(userId);
    ctx.reply(withSignature('Your selections have been reset. Send /start to begin again.'));
  });
};

module.exports = { handleStart, handleHelp, handleReset, isAdmin, adminMiddleware, withSignature };