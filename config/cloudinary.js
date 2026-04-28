const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const cloudinary = require('cloudinary').v2;

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  console.error('Cloudinary: Missing environment variables');
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

const testConnection = async () => {
  try {
    const result = await cloudinary.api.ping();
    if (result?.status === 'ok') {
      console.log('Cloudinary Configuration: valid');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Cloudinary Connection Test Failed:', error?.message || error);
    return false;
  }
};

const getFolderPath = (level, semester, subject, category) => {
  const safeSubject = subject.replace(/\s+/g, '-').toLowerCase();
  const safeCategory = category.toLowerCase();
  return `edu-bot/${level}/${semester}/${safeSubject}/${safeCategory}`;
};

const uploadBuffer = async (buffer, filename, metadata = {}, level, semester, subject, category) => {
  const folder = getFolderPath(level, semester, subject, category);
  
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'raw',
        folder: folder,
        public_id: filename,
        access_mode: 'public',
        type: 'upload',
        ...metadata
      },
      (error, result) => {
        if (error) {
          const msg = error?.message || JSON.stringify(error);
          return reject(new Error(`Upload failed: ${msg}`));
        }
        resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
};

const deleteFile = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
    return true;
  } catch (error) {
    console.error('Delete error:', error?.message || error);
    return false;
  }
};

module.exports = { 
  cloudinary, 
  testConnection, 
  uploadBuffer, 
  deleteFile,
  getFolderPath 
};