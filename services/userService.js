const User = require('../models/User');

const getOrCreateUser = async (userId) => {
  return await User.findOrCreate(userId);
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

module.exports = { getOrCreateUser, updateUserSelection, resetUser, getUserStats };