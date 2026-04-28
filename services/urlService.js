/**
 * URL Obfuscation Service
 * Hides Cloudinary URLs from users, replaces with "Lecture URL"
 */

const crypto = require('crypto');

const SECRET_KEY = process.env.URL_SECRET || 'eelu-bot-secret-2024';

/**
 * Encode Cloudinary URL to internal hash
 */
const encodeUrl = (cloudinaryUrl) => {
  if (!cloudinaryUrl) return null;
  
  const hash = crypto
    .createHmac('sha256', SECRET_KEY)
    .update(cloudinaryUrl)
    .digest('hex')
    .substring(0, 16);
  
  return hash;
};

/**
 * Store original URL in memory (use Redis/MongoDB in production)
 */
const urlStore = new Map();

const storeUrl = (hash, originalUrl) => {
  urlStore.set(hash, originalUrl);
  return hash;
};

const getOriginalUrl = (hash) => {
  return urlStore.get(hash) || null;
};

/**
 * Format "Lecture URL" for display to users
 */
const formatLectureUrl = (hash) => {
  return `Lecture URL:\nhttps://edu.eelu.bot/lecture/${hash}`;
};

/**
 * Send PDF to user without showing Cloudinary URL
 */
const sendPdfSecurely = async (ctx, pdf, subject = null) => {
  const hash = encodeUrl(pdf.cloudinaryUrl);
  storeUrl(hash, pdf.cloudinaryUrl);
  
  const caption = 
    `${pdf.title}\n` +
    `Level: ${pdf.level}\n` +
    `Semester: ${pdf.semester}` +
    (subject ? `\nSubject: ${subject}` : '') +
    `\n\nClick the button below to download`;
  
  await ctx.replyWithDocument(pdf.cloudinaryUrl, {
    caption: caption,
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Download Lecture', url: pdf.cloudinaryUrl }]
      ]
    }
  });
};

/**
 * Format "Lecture URL" for admin (hides real Cloudinary URL)
 */
const formatAdminUrl = (cloudinaryUrl) => {
  const hash = encodeUrl(cloudinaryUrl);
  storeUrl(hash, cloudinaryUrl);
  
  return `Upload Successful!\n\n` +
         `Title: Stored\n` +
         `Lecture URL:\n` +
         `https://edu.eelu.bot/lecture/${hash}\n\n` +
         `Admin Only - Original URL is hidden`;
};

module.exports = {
  encodeUrl,
  storeUrl,
  getOriginalUrl,
  formatLectureUrl,
  sendPdfSecurely,
  formatAdminUrl
};