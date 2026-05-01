const { Markup } = require('telegraf');
const userService = require('../services/userService');
const materialService = require('../services/materialService');
const PaginationService = require('../services/paginationService');
const { withSignature } = require('./startHandler');

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

const getFileEmoji = (fileType) => {
  const emojis = {
    pdf: '📄',
    powerpoint: '📊',
    image: '🖼️',
    zip: '📦',
    other: '📎'
  };
  return emojis[fileType] || '📎';
};

const registerFlowHandlers = (bot) => {
  // Level selection
  bot.action(/^level_(.+)$/, async (ctx) => {
    await ctx.answerCbQuery();
    const level = ctx.match[1];
    const userId = ctx.from.id;
    
    await userService.updateUserSelection(userId, { 
      level, 
      semester: null,
      subject: null,
      flowState: 'selecting-semester' 
    });
    
    await ctx.editMessageText(withSignature(
      `Level: ${capitalize(level)} Year\n\nSelect semester:`
    ), Markup.inlineKeyboard([
      [Markup.button.callback('First Semester', `semester_first_${level}`)],
      [Markup.button.callback('Second Semester', `semester_second_${level}`)]
    ]));
  });
  
  // Semester selection
  bot.action(/^semester_(first|second)_(.+)$/, async (ctx) => {
    await ctx.answerCbQuery();
    const semester = ctx.match[1];
    const level = ctx.match[2];
    const userId = ctx.from.id;
    
    await userService.updateUserSelection(userId, { 
      semester, 
      subject: null,
      flowState: 'selecting-subject' 
    });
    
    const subjects = curriculum[level]?.[semester] || [];
    
    if (subjects.length === 0) {
      return await ctx.editMessageText(withSignature(
        'No subjects found for this selection.'
      ), Markup.inlineKeyboard([
        [Markup.button.callback('Start Over', 'restart_flow')]
      ]));
    }
    
    const buttons = subjects.map(sub => 
      [Markup.button.callback(sub, `subject_${sub.replace(/\s+/g, '-').replace(/[()]/g, '').toLowerCase()}`)]
    );
    
    await ctx.editMessageText(withSignature(
      `${capitalize(level)} Year - ${capitalize(semester)} Semester\n\nSelect subject:`
    ), Markup.inlineKeyboard(buttons));
  });
  
  // Subject selection
  bot.action(/^subject_(.+)$/, async (ctx) => {
    await ctx.answerCbQuery();
    const subjectKey = ctx.match[1];
    const userId = ctx.from.id;
    
    const user = await userService.getOrCreateUser(userId);
    const subjects = curriculum[user.level]?.[user.semester] || [];
    const subject = subjects.find(s => 
      s.replace(/\s+/g, '-').replace(/[()]/g, '').toLowerCase() === subjectKey
    ) || subjectKey;
    
    await userService.updateUserSelection(userId, { 
      subject,
      flowState: 'selecting-category' 
    });
    
    // Count materials by category
    const lectures = await materialService.getMaterialsBySubject(user.level, user.semester, subject, 'lecture');
    const sections = await materialService.getMaterialsBySubject(user.level, user.semester, subject, 'section');
    const others = await materialService.getMaterialsBySubject(user.level, user.semester, subject, 'other');
    
    const lectureCount = lectures.length;
    const sectionCount = sections.length;
    const otherCount = others.length;
    
    await ctx.editMessageText(withSignature(
      `${capitalize(user.level)} Year - ${capitalize(user.semester)} Semester\n📚 ${subject}\n\n📊 Available Materials:\n` +
      `📚 Lectures: ${lectureCount}\n` +
      `📝 Sections: ${sectionCount}\n` +
      `📎 Others: ${otherCount}\n\n` +
      `Select category:`
    ), Markup.inlineKeyboard([
      [Markup.button.callback(`📚 Lectures (${lectureCount})`, `category_lecture`)],
      [Markup.button.callback(`📝 Sections (${sectionCount})`, `category_section`)],
      [Markup.button.callback(`📎 Others (${otherCount})`, `category_other`)],
      [Markup.button.callback('⬅️ Back', 'back_to_subjects')]
    ]));
  });
  
  // Category selection
  bot.action(/^category_(lecture|section|other)$/, async (ctx) => {
    await ctx.answerCbQuery();
    const category = ctx.match[1];
    const userId = ctx.from.id;
    
    const user = await userService.getOrCreateUser(userId);
    
    await userService.updateUserSelection(userId, { 
      flowState: 'selecting-material',
      currentPage: 0 
    });
    
    await showMaterialList(ctx, userId, user.level, user.semester, user.subject, category, 0);
  });
  
  // ✅ NEW: Pagination handler for material lists
  bot.action(/^pagination_download_material_(\d+)$/, async (ctx) => {
    await ctx.answerCbQuery();
    const page = parseInt(ctx.match[1], 10);
    const userId = ctx.from.id;
    const user = await userService.getOrCreateUser(userId);

    if (!user.level || !user.semester || !user.subject || !user.lastCategory) {
      return ctx.reply(withSignature('❌ Session expired. Please start again using /start'));
    }

    await showMaterialList(
      ctx,
      userId,
      user.level,
      user.semester,
      user.subject,
      user.lastCategory,
      page
    );
  });

  // No-op button (page counter - prevents console errors)
  bot.action('pagination_noop', async (ctx) => {
    await ctx.answerCbQuery();
  });
  
  // ✅ MATERIAL DOWNLOAD - Send file as buffer (NO URL)
  bot.action(/^download_material_(.+)$/, async (ctx) => {
    await ctx.answerCbQuery();
    const materialId = ctx.match[1];
    const userId = ctx.from.id;
    
    try {
      const material = await materialService.getMaterialById(materialId);
      
      if (!material) {
        return ctx.reply(withSignature('❌ Material not found. It may have been removed.'));
      }
      
      await userService.updateUserSelection(userId, { lastMaterialId: materialId });
      
      const categoryLabel = material.category === 'lecture' ? 'Lecture' : 
                           material.category === 'section' ? 'Section' : 'Other';
      
      // Send status message
      await ctx.reply(withSignature(
        `📄 Preparing ${categoryLabel} ${material.orderNumber}: ${material.title}...`
      ));
      
      // Download file from Cloudinary to buffer
      const fileBuffer = await materialService.downloadFileToBuffer(material.cloudinaryUrl);
      
      if (!fileBuffer) {
        return ctx.reply(withSignature(
          '❌ Failed to prepare file for download.\nPlease try again later.'
        ));
      }
      
      // Determine file extension
      const ext = material.fileExtension || 'pdf';
      const filename = `${material.title}.${ext}`;
      
      // Send file based on type
      if (material.fileType === 'image') {
        await ctx.replyWithPhoto(
          { source: fileBuffer, filename: filename },
          {
            caption: withSignature(
              `${material.title}\n${categoryLabel} ${material.orderNumber}\nSubject: ${material.subject}`
            )
          }
        );
      } else {
        // Send as document for PDF, PPT, ZIP, etc.
        await ctx.replyWithDocument(
          { source: fileBuffer, filename: filename },
          {
            caption: withSignature(
              `${material.title}\n${categoryLabel} ${material.orderNumber}\nSubject: ${material.subject}\nType: ${capitalize(material.fileType)}`
            )
          }
        );
      }
      
    } catch (error) {
      console.error('Download material error:', error);
      await ctx.reply(withSignature('❌ Error sending file. Please try again.'));
    }
  });
  
  // Restart flow
  bot.action('restart_flow', async (ctx) => {
    await ctx.answerCbQuery();
    const userId = ctx.from.id;
    await userService.updateUserSelection(userId, { 
      level: null, 
      semester: null, 
      subject: null,
      flowState: 'selecting-level' 
    });
    
    await ctx.editMessageText(withSignature(
      'Please select your college level:'
    ), Markup.inlineKeyboard([
      [Markup.button.callback('First Year', 'level_first')],
      [Markup.button.callback('Second Year', 'level_second')],
      [Markup.button.callback('Third Year', 'level_third')],
      [Markup.button.callback('Fourth Year', 'level_fourth')]
    ]));
  });
  
  // Back to subjects
  bot.action('back_to_subjects', async (ctx) => {
    await ctx.answerCbQuery();
    const userId = ctx.from.id;
    const user = await userService.getOrCreateUser(userId);
    
    await userService.updateUserSelection(userId, { subject: null });
    
    const subjects = curriculum[user.level]?.[user.semester] || [];
    const buttons = subjects.map(sub => 
      [Markup.button.callback(sub, `subject_${sub.replace(/\s+/g, '-').replace(/[()]/g, '').toLowerCase()}`)]
    );
    
    await ctx.editMessageText(withSignature(
      `${capitalize(user.level)} Year - ${capitalize(user.semester)} Semester\n\nSelect subject:`
    ), Markup.inlineKeyboard(buttons));
  });
  
  // Back to categories
  bot.action('back_to_categories', async (ctx) => {
    await ctx.answerCbQuery();
    const userId = ctx.from.id;
    const user = await userService.getOrCreateUser(userId);
    
    await ctx.editMessageText(withSignature(
      `${capitalize(user.level)} Year - ${capitalize(user.semester)} Semester\n📚 ${user.subject}\n\nSelect category:`
    ), Markup.inlineKeyboard([
      [Markup.button.callback('📚 Lectures', `category_lecture`)],
      [Markup.button.callback('📝 Sections', `category_section`)],
      [Markup.button.callback('📎 Others', `category_other`)],
      [Markup.button.callback('⬅️ Back', 'back_to_subjects')]
    ]));
  });
};

const showMaterialList = async (ctx, userId, level, semester, subject, category, page = 0) => {
  try {
    const materials = await materialService.getMaterialsByCategory(level, semester, subject, category);
    
    const categoryLabel = category === 'lecture' ? 'Lectures' : 
                         category === 'section' ? 'Sections' : 'Others';
    
    if (materials.length === 0) {
      return await ctx.editMessageText(withSignature(
        `❌ No ${categoryLabel} available for:\n${capitalize(level)} Year - ${capitalize(semester)} Semester\nSubject: ${subject}`
      ), Markup.inlineKeyboard([
        [Markup.button.callback('⬅️ Back to Categories', 'back_to_categories')],
        [Markup.button.callback('🔄 Start Over', 'restart_flow')]
      ]));
    }

    // ✅ PAGINATION: Split materials into pages (8 items per page)
    const itemsPerPage = 8;
    const pages = PaginationService.paginateArray(materials, itemsPerPage);
    const currentPage = Math.max(0, Math.min(page, pages.length - 1));
    const currentMaterials = pages[currentPage];

    // Save current category and pagination state to user
    await userService.updateUserSelection(userId, {
      lastCategory: category,
      lastLevel: level,
      lastSemester: semester,
      lastSubject: subject,
      currentPage: currentPage
    });

    // Format materials for pagination service
    const formattedMaterials = currentMaterials.map(mat => ({
      id: mat._id,
      label: `${capitalize(category.slice(0, -1))} ${mat.orderNumber}: ${mat.title.substring(0, 28)}${mat.title.length > 28 ? '...' : ''}`,
      emoji: getFileEmoji(mat.fileType)
    }));

    // Create header with page info
    const header = `🎓 ${capitalize(level)} Year • ${capitalize(semester)} Semester\n` +
                   `📚 ${subject}\n` +
                   `📂 ${categoryLabel} (${materials.length} total)\n\n` +
                   `📄 Page ${currentPage + 1}/${pages.length}\n\n` +
                   `Select to download:`;

    // Create keyboard with pagination
    const keyboard = PaginationService.createPaginationKeyboard(
      formattedMaterials,
      currentPage,
      pages.length,
      'download_material',
      [
        [Markup.button.callback('⬅️ Back', 'back_to_categories')],
        [Markup.button.callback('🔄 Restart', 'restart_flow')]
      ]
    );

    await ctx.editMessageText(withSignature(header), keyboard);

  } catch (error) {
    console.error('❌ Material list error:', error.message);
    await ctx.reply(withSignature('❌ Error loading materials. Try again.'));
  }
};

const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

module.exports = { registerFlowHandlers, capitalize };