const { Markup } = require('telegraf');
const { isAdmin, adminMiddleware, withSignature } = require('./startHandler');
const materialService = require('../services/materialService');

const SIGNATURE = '\n\n— اللهم صلي علي النبي';
const adminSessions = new Map();

const curriculum = {
  'first': {
    'first': ['Electronics', 'Mathematics 1', 'Technical Report Writing', 'Human Rights', 'Discrete Math', 'Introduction to Computers'],
    'second': ['Probability and Statistics-1', 'Creative and Scientific Thinking', 'Mathematics-2', 'Micro Economics', 'Logic Design', 'Programming Language']
  },
  'second': {
    'first': ['Object Oriented Programming', 'Introduction to Database Systems', 'Mathematics-3', 'Computer Networks Technology', 'Probability and Statistics-2', 'Introduction to Software Engineering'],
    'second': ['Introduction to Operation Research', 'Data Structure', 'Machine Learning Fundamentals', 'Web Technology', 'Entrepreneurship', 'Networking Fundamentals lab']
  },
  'third': {
    'first': ['Network Routing and Switching-Lab', 'Artificial Intelligence', 'Operating Systems', 'Digital Signal Processing', 'Computer Organization', 'Algorithms Analysis and Design'],
    'second': ['Pattern Recognition', 'Information Computer Networks Security', 'Natural Language Processing', 'Advanced Software Engineering', 'Microcontroller', 'Ethical Hacking-lab']
  },
  'fourth': {
    'first': ['Selected labs in Software Engineering', 'Embedded Systems', 'Computer Graphics', 'Advanced Computer Networks', 'Project (1)', 'Communication Technology'],
    'second': ['Cloud Computing Networking', 'Semantic Web and Ontology', 'Wireless and Mobile Networks', 'Fundamental of Management', 'Project (2)', 'Selected labs in AI']
  }
};

// Accept ANY file type
const ACCEPTED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-powerpoint',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/zip',
  'application/x-rar-compressed',
  'application/x-zip-compressed',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

const registerAdminHandlers = (bot) => {
  // Admin panel
  bot.command('admin', adminMiddleware, async (ctx) => {
    ctx.reply(withSignature(
      '🔐 Admin Control Panel\n\nChoose an action:'
    ), Markup.inlineKeyboard([
      [Markup.button.callback('📤 Upload Material', 'admin_upload')],
      [Markup.button.callback('📋 List All Files', 'admin_list')],
      [Markup.button.callback('🗑️ Delete Material', 'admin_delete_menu')]
    ]));
  });
  
  // Upload shortcut
  bot.command('upload', adminMiddleware, async (ctx) => {
    startUploadFlow(ctx, ctx.from.id);
  });
  
  // List all materials
  bot.command('listpdfs', adminMiddleware, async (ctx) => {
    await showMaterialList(ctx);
  });
  
  // Delete command
  bot.command('deletepdf', adminMiddleware, async (ctx) => {
    await showDeleteMenu(ctx);
  });
  
  // Callback handlers
  bot.action('admin_upload', async (ctx) => {
    if (!isAdmin(ctx.from.id)) {
      return ctx.answerCbQuery('Not authorized', { show_alert: true });
    }
    ctx.answerCbQuery();
    startUploadFlow(ctx, ctx.from.id);
  });
  
  bot.action('admin_list', async (ctx) => {
    if (!isAdmin(ctx.from.id)) {
      return ctx.answerCbQuery('Not authorized', { show_alert: true });
    }
    ctx.answerCbQuery();
    await showMaterialList(ctx);
  });
  
  bot.action('admin_delete_menu', async (ctx) => {
    if (!isAdmin(ctx.from.id)) {
      return ctx.answerCbQuery('Not authorized', { show_alert: true });
    }
    ctx.answerCbQuery();
    await showDeleteMenu(ctx);
  });
  
  bot.action(/^confirm_delete_(.+)$/, async (ctx) => {
    if (!isAdmin(ctx.from.id)) {
      return ctx.answerCbQuery('Not authorized', { show_alert: true });
    }
    ctx.answerCbQuery();
    
    const materialId = ctx.match[1];
    const result = await materialService.deleteMaterial(materialId);
    
    if (result.success) {
      await ctx.editMessageText(withSignature(
        `✅ Deleted Successfully!\n\n📄 ${result.title}\n\nRemoved from storage and database.`
      ));
    } else {
      await ctx.editMessageText(withSignature(
        `❌ Delete Failed\n\n${result.message}`
      ));
    }
  });
  
  bot.action('cancel_delete', async (ctx) => {
    if (!isAdmin(ctx.from.id)) {
      return ctx.answerCbQuery('Not authorized', { show_alert: true });
    }
    ctx.answerCbQuery();
    await ctx.editMessageText(withSignature('❌ Delete cancelled.'));
  });
  
  // Upload flow steps
  bot.action(/^upload_level_(.+)$/, (ctx) => {
    if (!isAdmin(ctx.from.id)) return;
    const level = ctx.match[1];
    const userId = ctx.from.id;
    adminSessions.set(userId, { level, step: 'semester' });
    
    ctx.editMessageText(withSignature(
      `📤 Upload Material\n\nLevel: ${capitalize(level)}\n\nSelect semester:`
    ), Markup.inlineKeyboard([
      [Markup.button.callback('First Semester', 'upload_semester_first')],
      [Markup.button.callback('Second Semester', 'upload_semester_second')]
    ]));
  });
  
  bot.action(/^upload_semester_(first|second)$/, (ctx) => {
    if (!isAdmin(ctx.from.id)) return;
    const semester = ctx.match[1];
    const userId = ctx.from.id;
    const session = adminSessions.get(userId);
    
    if (!session) return ctx.reply(withSignature('Session expired. Send /upload again.'));
    
    session.semester = semester;
    session.step = 'subject';
    
    const subjects = curriculum[session.level]?.[semester] || [];
    const buttons = subjects.map(sub => 
      [Markup.button.callback(sub, `upload_subject_${sub.replace(/\s+/g, '-').replace(/[()]/g, '').toLowerCase()}`)]
    );
    
    ctx.editMessageText(withSignature(
      `📤 Upload Material\n\nLevel: ${capitalize(session.level)}\nSemester: ${semester}\n\nSelect subject:`
    ), Markup.inlineKeyboard(buttons));
  });
  
  bot.action(/^upload_subject_(.+)$/, async (ctx) => {
    if (!isAdmin(ctx.from.id)) return;
    const subjectKey = ctx.match[1];
    const userId = ctx.from.id;
    const session = adminSessions.get(userId);
    
    if (!session) return ctx.reply(withSignature('Session expired.'));
    
    const subjects = curriculum[session.level]?.[session.semester] || [];
    const subject = subjects.find(s => 
      s.replace(/\s+/g, '-').replace(/[()]/g, '').toLowerCase() === subjectKey
    ) || subjectKey;
    
    // Count existing materials by category
    const lectures = await materialService.getMaterialsBySubject(session.level, session.semester, subject, 'lecture');
    const sections = await materialService.getMaterialsBySubject(session.level, session.semester, subject, 'section');
    const others = await materialService.getMaterialsBySubject(session.level, session.semester, subject, 'other');
    
    const lectureCount = lectures.length;
    const sectionCount = sections.length;
    const otherCount = others.length;
    
    session.subject = subject;
    session.step = 'category';
    
    ctx.editMessageText(withSignature(
      `📤 Upload Material\n\nLevel: ${capitalize(session.level)}\nSemester: ${session.semester}\nSubject: ${subject}\n\n` +
      `📊 Current Materials:\n` +
      `📚 Lectures: ${lectureCount}\n` +
      `📝 Sections: ${sectionCount}\n` +
      `📎 Others: ${otherCount}\n\n` +
      `Select category to upload:`
    ), Markup.inlineKeyboard([
      [Markup.button.callback(`📚 Lecture (${lectureCount})`, 'upload_category_lecture')],
      [Markup.button.callback(`📝 Section (${sectionCount})`, 'upload_category_section')],
      [Markup.button.callback(`📎 Other (${otherCount})`, 'upload_category_other')]
    ]));
  });
  
  bot.action(/^upload_category_(lecture|section|other)$/, async (ctx) => {
    if (!isAdmin(ctx.from.id)) return;
    const category = ctx.match[1];
    const userId = ctx.from.id;
    const session = adminSessions.get(userId);
    
    if (!session) return ctx.reply(withSignature('Session expired.'));
    
    session.category = category;
    session.step = 'file';
    
    const categoryLabel = category === 'lecture' ? 'Lecture' : 
                         category === 'section' ? 'Section' : 'Other';
    
    const nextOrder = await materialService.getNextOrderNumber(
      session.level, 
      session.semester, 
      session.subject, 
      category
    );
    
    session.orderNumber = nextOrder;
    
    // Initialize file queue
    if (!session.fileQueue) session.fileQueue = [];
    session.baseOrderNumber = nextOrder;
    adminSessions.set(userId, session);
    
    ctx.editMessageText(withSignature(
      `📤 Upload ${categoryLabel}\n\n` +
      `Level: ${capitalize(session.level)}\n` +
      `Semester: ${session.semester}\n` +
      `Subject: ${session.subject}\n` +
      `Starting ${categoryLabel} Number: ${nextOrder}\n\n` +
      `⬆️ Send multiple files now!\n\n` +
      `Accepted: PDF, PowerPoint, Word, Images, ZIP, TXT\n\n` +
      `📁 Queued files: 0`
    ), Markup.inlineKeyboard([
      [Markup.button.callback('⬆️ Upload All', 'upload_all_files')],
      [Markup.button.callback('❌ Cancel', 'cancel_upload_batch')]
    ]));
  });
  
  // Handle document upload - Queue files (PDF, PPT, ZIP, etc.)
  bot.on('document', async (ctx) => {
    const userId = ctx.from.id;
    const session = adminSessions.get(userId);
    
    if (!session || session.step !== 'file') return;
    if (!isAdmin(userId)) return;
    
    const doc = ctx.message.document;
    
    try {
      // Initialize queue if needed
      if (!session.fileQueue) session.fileQueue = [];
      
      // Get file link and buffer
      const fileLink = await ctx.telegram.getFileLink(doc.file_id);
      const response = await fetch(fileLink);
      const buffer = Buffer.from(await response.arrayBuffer());
      
      const fileType = materialService.getFileTypeFromMime(doc.mime_type, doc.file_name);
      const fileExtension = materialService.getFileExtension(doc.file_name);
      
      // Add to queue
      session.fileQueue.push({
        buffer: buffer,
        fileName: doc.file_name,
        fileType: fileType,
        fileExtension: fileExtension,
        fileSize: doc.file_size || 0,
        mimeType: doc.mime_type
      });
      
      adminSessions.set(userId, session);
      
      // Update message with queued files
      const fileList = session.fileQueue
        .map((f, i) => `${i + 1}. 📄 ${f.fileName}`)
        .join('\n');
      
      ctx.reply(withSignature(
        `✅ File queued!\n\n` +
        `📁 Queued files: ${session.fileQueue.length}\n\n` +
        `${fileList}\n\n` +
        `📤 Send more files or click "Upload All"`
      ), Markup.inlineKeyboard([
        [Markup.button.callback('⬆️ Upload All Now', 'upload_all_files')],
        [Markup.button.callback('❌ Cancel', 'cancel_upload_batch')]
      ]));
      
    } catch (error) {
      console.error('File queue error:', error);
      ctx.reply(withSignature('❌ Failed to queue file. Please try again.'));
    }
  });
  
  // Handle photo upload - Queue images
  bot.on('photo', async (ctx) => {
    const userId = ctx.from.id;
    const session = adminSessions.get(userId);
    
    if (!session || session.step !== 'file') return;
    if (!isAdmin(userId)) return;
    
    try {
      // Initialize queue if needed
      if (!session.fileQueue) session.fileQueue = [];
      
      const photo = ctx.message.photo[ctx.message.photo.length - 1];
      const fileLink = await ctx.telegram.getFileLink(photo.file_id);
      const response = await fetch(fileLink);
      const buffer = Buffer.from(await response.arrayBuffer());
      
      const timestamp = Date.now();
      const fileName = `image_${timestamp}.jpg`;
      
      // Add to queue
      session.fileQueue.push({
        buffer: buffer,
        fileName: fileName,
        fileType: 'image',
        fileExtension: 'jpg',
        fileSize: photo.file_size || 0,
        mimeType: 'image/jpeg'
      });
      
      adminSessions.set(userId, session);
      
      // Update message with queued files
      const fileList = session.fileQueue
        .map((f, i) => `${i + 1}. 📄 ${f.fileName}`)
        .join('\n');
      
      ctx.reply(withSignature(
        `✅ Image queued!\n\n` +
        `📁 Queued files: ${session.fileQueue.length}\n\n` +
        `${fileList}\n\n` +
        `📤 Send more files or click "Upload All"`
      ), Markup.inlineKeyboard([
        [Markup.button.callback('⬆️ Upload All Now', 'upload_all_files')],
        [Markup.button.callback('❌ Cancel', 'cancel_upload_batch')]
      ]));
      
    } catch (error) {
      console.error('Image queue error:', error);
      ctx.reply(withSignature('❌ Failed to queue image. Please try again.'));
    }
  });
  
  // Upload all queued files at once
  bot.action('upload_all_files', async (ctx) => {
    if (!isAdmin(ctx.from.id)) {
      return ctx.answerCbQuery('Not authorized', { show_alert: true });
    }
    const userId = ctx.from.id;
    const session = adminSessions.get(userId);
    
    if (!session || !session.fileQueue || session.fileQueue.length === 0) {
      return ctx.answerCbQuery('No files queued', { show_alert: true });
    }
    
    ctx.answerCbQuery();
    
    try {
      await ctx.reply(withSignature(`⏳ Uploading ${session.fileQueue.length} file(s)...`));
      
      const uploadedFiles = [];
      let orderNumber = session.baseOrderNumber;
      
      // Upload all files
      for (const file of session.fileQueue) {
        try {
          const timestamp = Date.now();
          const categoryLabel = session.category === 'lecture' ? 'lec' : 
                               session.category === 'section' ? 'sec' : 'oth';
          const filename = `${categoryLabel}_${orderNumber}_${timestamp}`;
          
          const result = await materialService.uploadMaterial(
            file.buffer,
            filename,
            {
              title: file.fileName.replace(/\.[^/.]+$/, '') || filename,
              level: session.level,
              semester: session.semester,
              subject: session.subject,
              category: session.category,
              orderNumber: orderNumber,
              fileType: file.fileType,
              fileExtension: file.fileExtension,
              originalName: file.fileName,
              fileSize: file.fileSize || 0
            },
            userId,
            session.level,
            session.semester,
            session.subject,
            session.category
          );
          
          uploadedFiles.push({
            title: result.material.title,
            orderNumber: orderNumber,
            type: file.fileType
          });
          
          orderNumber++;
          
        } catch (fileError) {
          console.error('Error uploading file:', fileError);
          uploadedFiles.push({
            title: file.fileName,
            orderNumber: orderNumber,
            type: 'FAILED',
            error: true
          });
          orderNumber++;
        }
      }
      
      adminSessions.delete(userId);
      
      // Show summary
      const catLabel = capitalize(session.category);
      const successCount = uploadedFiles.filter(f => !f.error).length;
      const failedCount = uploadedFiles.filter(f => f.error).length;
      
      let summary = `✅ Batch Upload Complete!\n\n`;
      summary += `📁 ${catLabel} Files: ${successCount} succeeded`;
      if (failedCount > 0) summary += `, ${failedCount} failed`;
      summary += `\n\n`;
      summary += uploadedFiles.map((f, i) => {
        const icon = f.error ? '❌' : '✅';
        return `${icon} ${f.title} (#${f.orderNumber})`;
      }).join('\n');
      summary += `\n\n✅ All files uploaded to database!`;
      
      ctx.reply(withSignature(summary));
      
    } catch (error) {
      console.error('Batch upload error:', error);
      adminSessions.delete(userId);
      ctx.reply(withSignature('❌ Upload failed. Please try again.'));
    }
  });
  
  // Cancel batch upload
  bot.action('cancel_upload_batch', async (ctx) => {
    if (!isAdmin(ctx.from.id)) {
      return ctx.answerCbQuery('Not authorized', { show_alert: true });
    }
    const userId = ctx.from.id;
    adminSessions.delete(userId);
    
    ctx.answerCbQuery();
    await ctx.editMessageText(withSignature('❌ Batch upload cancelled. No files were uploaded.'));
  });
};

const showMaterialList = async (ctx) => {
  const materials = await materialService.getAllMaterials(true);
  
  if (materials.length === 0) {
    return ctx.reply(withSignature('📭 No files uploaded yet.'));
  }
  
  // Split into chunks to avoid exceeding 4096 character limit
  const MAX_MESSAGE_LENGTH = 3800; // Leave buffer for signature
  const chunks = [];
  let currentMessage = '📋 All Uploaded Materials:\n\n';
  
  materials.forEach((mat, idx) => {
    const catLabel = mat.category === 'lecture' ? 'Lec' : 
                    mat.category === 'section' ? 'Sec' : 'Oth';
    const itemText = `${idx + 1}. [${catLabel}${mat.orderNumber}] ${mat.title}\n` +
                     `   Level: ${mat.level} | Sem: ${mat.semester}\n` +
                     `   Subject: ${mat.subject}\n` +
                     `   Type: ${mat.fileType}\n\n`;
    
    // Check if adding this item would exceed the limit
    if ((currentMessage + itemText + SIGNATURE).length > MAX_MESSAGE_LENGTH) {
      // Save current message and start a new one
      chunks.push(currentMessage);
      currentMessage = `📋 Materials (continued):\n\n${itemText}`;
    } else {
      currentMessage += itemText;
    }
  });
  
  // Add the last chunk
  if (currentMessage.trim().length > 0) {
    chunks.push(currentMessage);
  }
  
  // Send all chunks
  for (const chunk of chunks) {
    await ctx.reply(withSignature(chunk));
  }
};

const showDeleteMenu = async (ctx) => {
  const materials = await materialService.getAllMaterials(true);
  
  if (materials.length === 0) {
    return ctx.reply(withSignature('📭 No files to delete.'));
  }
  
  // Split into chunks to avoid exceeding 4096 character limit
  const MAX_MESSAGE_LENGTH = 3800;
  const chunks = [];
  let currentMessage = '🗑️ Delete Materials:\n\n';
  let itemCount = 0;
  
  materials.forEach((mat, idx) => {
    const catLabel = mat.category === 'lecture' ? 'Lec' : 
                    mat.category === 'section' ? 'Sec' : 'Oth';
    const itemText = `${idx + 1}. [${catLabel}${mat.orderNumber}] ${mat.title}\n` +
                     `   Level: ${mat.level} | Sem: ${mat.semester}\n` +
                     `   Subject: ${mat.subject}\n` +
                     `   Type: ${capitalize(mat.fileType)}\n`;
    
    // Check if adding this item would exceed the limit or we have 8 items per chunk
    if (((currentMessage + itemText + SIGNATURE).length > MAX_MESSAGE_LENGTH) || itemCount >= 8) {
      // Save current message and start a new one
      chunks.push({ message: currentMessage, startIdx: idx - itemCount, endIdx: idx - 1, itemCount });
      currentMessage = `🗑️ Delete Materials (continued):\n\n${itemText}`;
      itemCount = 1;
    } else {
      currentMessage += itemText;
      itemCount++;
    }
  });
  
  // Add the last chunk
  if (currentMessage.trim().length > 0) {
    chunks.push({ message: currentMessage, itemCount });
  }
  
  // Send all chunks with delete buttons
  for (let chunkIdx = 0; chunkIdx < chunks.length; chunkIdx++) {
    const chunk = chunks[chunkIdx];
    const startIdx = chunk.startIdx || (chunkIdx === 0 ? 0 : materials.length);
    const endIdx = chunk.endIdx || materials.length - 1;
    
    // Get materials for this chunk
    const chunkMaterials = chunkIdx === 0 
      ? materials.slice(0, chunk.itemCount)
      : materials.slice(startIdx, endIdx + 1);
    
    // Create buttons for this chunk
    const buttons = chunkMaterials.map(mat =>
      [Markup.button.callback(
        `🗑️ Delete: ${mat.title.substring(0, 35)}${mat.title.length > 35 ? '...' : ''}`,
        `confirm_delete_${mat._id}`
      )]
    );
    
    // Add pagination info if multiple chunks
    if (chunks.length > 1) {
      buttons.push([Markup.button.callback(`Page ${chunkIdx + 1}/${chunks.length}`, 'pagination_noop')]);
    }
    
    await ctx.reply(
      withSignature(chunk.message),
      Markup.inlineKeyboard(buttons)
    );
  }
  
  await ctx.reply(withSignature('⚠️ Click 🗑️ Delete to permanently remove a material.'));
};

const startUploadFlow = (ctx, userId) => {
  adminSessions.set(userId, { step: 'level' });
  ctx.reply(withSignature(
    '📤 Upload Material Wizard\n\nSelect college level:'
  ), Markup.inlineKeyboard([
    [Markup.button.callback('First Year', 'upload_level_first')],
    [Markup.button.callback('Second Year', 'upload_level_second')],
    [Markup.button.callback('Third Year', 'upload_level_third')],
    [Markup.button.callback('Fourth Year', 'upload_level_fourth')]
  ]));
};

const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

module.exports = { registerAdminHandlers };