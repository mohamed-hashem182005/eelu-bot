const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  title: { type: String, required: true },
  level: { type: String, enum: ['first', 'second', 'third', 'fourth'], required: true },
  semester: { type: String, enum: ['first', 'second'], required: true },
  subject: { type: String, required: true },
  
  category: { 
    type: String, 
    enum: ['lecture', 'section', 'other'], 
    required: true 
  },
  
  orderNumber: { type: Number, default: 1 },
  
  fileType: { 
    type: String, 
    enum: ['pdf', 'powerpoint', 'image', 'zip', 'other'], 
    default: 'pdf' 
  },
  
  fileExtension: { type: String, default: 'pdf' },
  originalName: { type: String, default: '' },
  fileSize: { type: Number, default: 0 },
  
  cloudinaryUrl: { type: String, required: true },
  publicId: { type: String, required: true },
  uploadedBy: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

materialSchema.index({ level: 1, semester: 1, subject: 1, category: 1, orderNumber: 1 });

// Export as Material
module.exports = mongoose.model('Material', materialSchema);