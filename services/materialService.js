const Material = require('../models/Material');
const { uploadBuffer, deleteFile } = require('../config/cloudinary');

const getAllMaterials = async (includeInactive = false) => {
  const query = includeInactive ? {} : { isActive: true };
  return await Material.find(query).sort({ level: 1, semester: 1, subject: 1, category: 1, orderNumber: 1 });
};

const getMaterialsBySubject = async (level, semester, subject, category = null) => {
  const query = { level, semester, subject, isActive: true };
  if (category) query.category = category;
  return await Material.find(query).sort({ orderNumber: 1, createdAt: 1 });
};

const getMaterialsByCategory = async (level, semester, subject, category) => {
  return await Material.find({ 
    level, 
    semester, 
    subject, 
    category, 
    isActive: true 
  }).sort({ orderNumber: 1 });
};

const getMaterialById = async (materialId) => {
  return await Material.findById(materialId);
};

const getNextOrderNumber = async (level, semester, subject, category) => {
  try {
    const lastMaterial = await Material.findOne({ 
      level, 
      semester, 
      subject, 
      category 
    }).sort({ orderNumber: -1 });
    
    return lastMaterial ? lastMaterial.orderNumber + 1 : 1;
  } catch (error) {
    console.error('getNextOrderNumber error:', error);
    return 1; // Default to 1 if error
  }
};

const uploadMaterial = async (buffer, filename, metadata, uploadedBy, level, semester, subject, category) => {
  const result = await uploadBuffer(
    buffer, 
    filename, 
    { context: `uploaded_by_${uploadedBy}` },
    level,
    semester,
    subject,
    category
  );
  
  const cleanUrl = result.secure_url.trim();
  
  const material = await Material.create({
    title: metadata.title || filename,
    level: metadata.level,
    semester: metadata.semester,
    subject: metadata.subject,
    category: metadata.category,
    orderNumber: metadata.orderNumber || 1,
    fileType: metadata.fileType || 'other',
    fileExtension: metadata.fileExtension || 'pdf',
    originalName: metadata.originalName || filename,
    fileSize: metadata.fileSize || 0,
    cloudinaryUrl: cleanUrl,
    publicId: result.public_id,
    uploadedBy
  });
  
  return { material, cloudinaryUrl: cleanUrl };
};

const updateMaterial = async (materialId, updates) => {
  return await Material.findByIdAndUpdate(materialId, updates, { new: true });
};

const deleteMaterial = async (materialId) => {
  try {
    const material = await Material.findById(materialId);
    if (!material) return { success: false, message: 'Material not found' };
    
    if (material.publicId) {
      await deleteFile(material.publicId);
    }
    
    await Material.findByIdAndDelete(materialId);
    await reorderMaterials(material.level, material.semester, material.subject, material.category);
    
    return { success: true, message: 'Material deleted successfully', title: material.title };
  } catch (error) {
    console.error('Delete material error:', error);
    return { success: false, message: error.message };
  }
};

const reorderMaterials = async (level, semester, subject, category) => {
  try {
    const materials = await Material.find({ 
      level, 
      semester, 
      subject, 
      category 
    }).sort({ createdAt: 1 });
    
    for (let i = 0; i < materials.length; i++) {
      materials[i].orderNumber = i + 1;
      await materials[i].save();
    }
  } catch (error) {
    console.error('Reorder error:', error);
  }
};

// Download file from Cloudinary URL to buffer
const downloadFileToBuffer = async (url) => {
  try {
    const cleanUrl = url.trim();
    const response = await fetch(cleanUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) {
      console.error(`Download failed: ${response.status} ${response.statusText}`);
      return null;
    }
    
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error('Download to buffer error:', error);
    return null;
  }
};

const getFileTypeFromMime = (mimeType, fileName) => {
  if (!mimeType) return 'other';
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation') || fileName.endsWith('.pptx') || fileName.endsWith('.ppt')) return 'powerpoint';
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType === 'application/zip' || fileName.endsWith('.zip') || fileName.endsWith('.rar')) return 'zip';
  return 'other';
};

const getFileExtension = (fileName) => {
  if (!fileName) return 'unknown';
  const parts = fileName.split('.');
  return parts.length > 1 ? parts.pop().toLowerCase() : 'unknown';
};

const seedMaterials = async () => {
  console.log('Seeding not implemented - upload via /upload');
};

module.exports = {
  getAllMaterials,
  getMaterialsBySubject,
  getMaterialsByCategory,
  getMaterialById,
  getNextOrderNumber,
  uploadMaterial,
  updateMaterial,
  deleteMaterial,
  reorderMaterials,
  downloadFileToBuffer,
  getFileTypeFromMime,
  getFileExtension,
  seedMaterials
};