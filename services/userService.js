const User = require('../models/User');

const getOrCreateUser = async (userId) => {
  return await User.findOrCreate(userId);
};

// ✅ Extract and upsert user data from Telegram msg.from
const upsertUserFromTelegram = async (telegramUser) => {
  if (!telegramUser || !telegramUser.id) {
    throw new Error('Invalid Telegram user object');
  }

  const userData = {
    userId: telegramUser.id,
    firstName: telegramUser.first_name || null,
    lastName: telegramUser.last_name || null,
    username: telegramUser.username || null
  };

  return await User.findOneAndUpdate(
    { userId: telegramUser.id },
    userData,
    { new: true, upsert: true }
  );
};

const updateUserSelection = async (userId, data) => {
  return await User.findOneAndUpdate(
    { userId },
    { ...data, updatedAt: new Date() },
    { new: true, upsert: true }
  );
};

const resetUser = async (userId) => {
  return await User.findOneAndUpdate(
    { userId },
    { 
      level: null, 
      semester: null, 
      subject: null, 
      lastMaterialId: null,
      flowState: 'idle' 
    },
    { new: true }
  );
};

const getUserStats = async () => {
  return await User.countDocuments();
};

module.exports = { getOrCreateUser, updateUserSelection, resetUser, getUserStats, upsertUserFromTelegram };