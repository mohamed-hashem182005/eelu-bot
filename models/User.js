const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: { type: Number, required: true, unique: true },
  firstName: { type: String, default: null },
  lastName: { type: String, default: null },
  username: { type: String, default: null },
  level: { type: String, enum: ['first', 'second', 'third', 'fourth'], default: null },
  semester: { type: String, enum: ['first', 'second'], default: null },
  subject: { type: String, default: null },
  lastMaterialId: { type: String, default: null },
  flowState: { 
    type: String, 
    enum: ['idle', 'selecting-level', 'selecting-semester', 'selecting-subject', 'selecting-category', 'selecting-material', 'completed'], 
    default: 'idle' 
  },
}, { timestamps: true });

userSchema.statics.findOrCreate = async function(userId) {
  let user = await this.findOne({ userId });
  if (!user) {
    user = await this.create({ userId });
  }
  return user;
};

module.exports = mongoose.model('User', userSchema);