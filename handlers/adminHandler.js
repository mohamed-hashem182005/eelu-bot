const { Markup } = require('telegraf');
const { isAdmin, adminMiddleware, withSignature } = require('./startHandler');
const materialService = require('../services/materialService');

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
  
  bot.action(/^upload_subject_(.+)$/, (ctx) => {
    if (!isAdmin(ctx.from.id)) return;
    const subjectKey = ctx.match[1];
    const userId = ctx.from.id;
    const session = adminSessions.get(userId);
    
    if (!session) return ctx.reply(withSignature('Session expired.'));
    
    const subjects = curriculum[session.level]?.[session.semester] || [];
    const subject = subjects.find(s => 
      s.replace(/\s+/g, '-').replace(/[()]/g, '').toLowerCase() === subjectKey
    ) || subjectKey;
    
    session.subject = subject;
    session.step = 'category';
    
    ctx.editMessageText(withSignature(
      `📤 Upload Material\n\nLevel: ${capitalize(session.level)}\nSemester: ${session.semester}\nSubject: ${subject}\n\nSelect category:`
    ), Markup.inlineKeyboard([
      [Markup.button.callback('📚 Lecture', 'upload_category_lecture')],
      [Markup.button.callback('📝 Section', 'upload_category_section')],
      [Markup.button.callback('📎 Other', 'upload_category_other')]
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
    
    ctx.editMessageText(withSignature(
      `📤 Upload ${categoryLabel}\n\n` +
      `Level: ${capitalize(session.level)}\n` +
      `Semester: ${session.semester}\n` +
      `Subject: ${session.subject}\n` +
      `${categoryLabel} Number: ${nextOrder}\n\n` +
      `⬆️ Please send the file now.\n\n` +
      `Accepted: PDF, PowerPoint, Word, Images, ZIP, TXT`
    ));
  });
  
  // Handle document upload (PDF, PPT, ZIP, etc.)
  bot.on('document', async (ctx) => {
    const userId = ctx.from.id;
    const session = adminSessions.get(userId);
    
    if (!session || session.step !== 'file') return;
    if (!isAdmin(userId)) return;
    
    const doc = ctx.message.document;
    
    // Accept any file type (no strict validation)
    try {
      await ctx.reply(withSignature('⏳ Uploading to cloud storage...'));
      
      const fileLink = await ctx.telegram.getFileLink(doc.file_id);
      const response = await fetch(fileLink);
      const buffer = Buffer.from(await response.arrayBuffer());
      
      const fileType = materialService.getFileTypeFromMime(doc.mime_type, doc.file_name);
      const fileExtension = materialService.getFileExtension(doc.file_name);
      
      const timestamp = Date.now();
      const categoryLabel = session.category === 'lecture' ? 'lec' : 
                           session.category === 'section' ? 'sec' : 'oth';
      const filename = `${categoryLabel}_${session.orderNumber}_${timestamp}`;
      
      const result = await materialService.uploadMaterial(
        buffer,
        filename,
        {
          title: doc.file_name.replace(/\.[^/.]+$/, '') || filename,
          level: session.level,
          semester: session.semester,
          subject: session.subject,
          category: session.category,
          orderNumber: session.orderNumber,
          fileType: fileType,
          fileExtension: fileExtension,
          originalName: doc.file_name,
          fileSize: doc.file_size || 0
        },
        userId,
        session.level,
        session.semester,
        session.subject,
        session.category
      );
      
      adminSessions.delete(userId);
      
      const catLabel = capitalize(session.category);
      
      ctx.reply(withSignature(
        `✅ ${catLabel} Uploaded Successfully!\n\n` +
        `📄 ${result.material.title}\n` +
        `🎓 Level: ${capitalize(session.level)}\n` +
        `📅 Semester: ${session.semester}\n` +
        `📚 Subject: ${session.subject}\n` +
        `📂 Category: ${catLabel}\n` +
        `🔢 Number: ${session.orderNumber}\n` +
        `📎 Type: ${capitalize(fileType)}\n\n` +
        `✅ Upload complete!`
      ));
      
    } catch (error) {
      console.error('Upload error:', error);
      ctx.reply(withSignature('❌ Failed to upload. Please try again.'));
      adminSessions.delete(userId);
    }
  });
  
  // Handle photo upload (images)
  bot.on('photo', async (ctx) => {
    const userId = ctx.from.id;
    const session = adminSessions.get(userId);
    
    if (!session || session.step !== 'file') return;
    if (!isAdmin(userId)) return;
    
    try {
      await ctx.reply(withSignature('⏳ Uploading image...'));
      
      const photo = ctx.message.photo[ctx.message.photo.length - 1];
      const fileLink = await ctx.telegram.getFileLink(photo.file_id);
      const response = await fetch(fileLink);
      const buffer = Buffer.from(await response.arrayBuffer());
      
      const timestamp = Date.now();
      const categoryLabel = session.category === 'lecture' ? 'lec' : 
                           session.category === 'section' ? 'sec' : 'oth';
      const filename = `${categoryLabel}_${session.orderNumber}_${timestamp}`;
      
      const result = await materialService.uploadMaterial(
        buffer,
        filename,
        {
          title: `Image_${session.orderNumber}`,
          level: session.level,
          semester: session.semester,
          subject: session.subject,
          category: session.category,
          orderNumber: session.orderNumber,
          fileType: 'image',
          fileExtension: 'jpg',
          originalName: `image_${timestamp}.jpg`,
          fileSize: photo.file_size || 0
        },
        userId,
        session.level,
        session.semester,
        session.subject,
        session.category
      );
      
      adminSessions.delete(userId);
      
      ctx.reply(withSignature(
        `✅ Image Uploaded Successfully!\n\n` +
        `🖼️ ${result.material.title}\n` +
        `🎓 Level: ${capitalize(session.level)}\n` +
        `📅 Semester: ${session.semester}\n` +
        `📚 Subject: ${session.subject}\n` +
        `📂 Category: ${capitalize(session.category)}\n` +
        `🔢 Number: ${session.orderNumber}\n\n` +
        `✅ Upload complete!`
      ));
      
    } catch (error) {
      console.error('Upload image error:', error);
      ctx.reply(withSignature('❌ Failed to upload image. Please try again.'));
      adminSessions.delete(userId);
    }
  });
};

const showMaterialList = async (ctx) => {
  const materials = await materialService.getAllMaterials(true);
  
  if (materials.length === 0) {
    return ctx.reply(withSignature('📭 No files uploaded yet.'));
  }
  
  let message = '📋 All Uploaded Materials:\n\n';
  materials.forEach((mat, idx) => {
    const catLabel = mat.category === 'lecture' ? 'Lec' : 
                    mat.category === 'section' ? 'Sec' : 'Oth';
    message += `${idx + 1}. [${catLabel}${mat.orderNumber}] ${mat.title}\n`;
    message += `   Level: ${mat.level} | Sem: ${mat.semester}\n`;
    message += `   Subject: ${mat.subject}\n`;
    message += `   Type: ${mat.fileType}\n\n`;
  });
  
  ctx.reply(withSignature(message));
};

const showDeleteMenu = async (ctx) => {
  const materials = await materialService.getAllMaterials(true);
  
  if (materials.length === 0) {
    return ctx.reply(withSignature('📭 No files to delete.'));
  }
  
  for (const mat of materials) {
    const catLabel = mat.category === 'lecture' ? 'Lecture' : 
                    mat.category === 'section' ? 'Section' : 'Other';
    
    await ctx.reply(
      withSignature(
        `📄 [${catLabel} ${mat.orderNumber}] ${mat.title}\n` +
        `🎓 ${capitalize(mat.level)} | ${capitalize(mat.semester)}\n` +
        `📚 ${mat.subject}\n` +
        `📎 ${capitalize(mat.fileType)}`
      ),
      Markup.inlineKeyboard([
        [Markup.button.callback('🗑️ Delete This Material', `confirm_delete_${mat._id}`)]
      ])
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