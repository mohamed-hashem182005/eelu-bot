# 📚 Educational Telegram Bot - Complete Project Documentation

## 🚀 Quick Links

| Document | Purpose |
|----------|---------|
| [QUICKSTART.md](./QUICKSTART.md) | Get up and running in 5 minutes |
| [README.md](./README.md) | Full documentation and guides |
| [.env.example](./.env.example) | Environment variables template |

---

## 📁 Project Structure

```
edu-bot/
├── 📄 bot.js                 # Main entry point - starts the bot
├── 📄 setup.js               # Pre-flight setup checker
├── 📄 package.json           # Node.js dependencies
├── 📄 .env                   # Environment variables (keep secret!)
├── 📄 README.md              # Full documentation
├── 📄 QUICKSTART.md          # Quick start guide
├── 📄 INDEX.md               # This file
│
├── 📂 config/                # Configuration modules
│   ├── db.js                 # MongoDB connection
│   └── cloudinary.js         # Cloudinary setup
│
├── 📂 models/                # Database models (Mongoose)
│   ├── User.js               # User data structure
│   └── Pdf.js                # PDF metadata structure
│
├── 📂 services/              # Business logic
│   ├── userService.js        # User management functions
│   └── pdfService.js         # PDF operations
│
├── 📂 handlers/              # Telegram command handlers
│   ├── startHandler.js       # /start, /help, /reset commands
│   ├── flowHandler.js        # User selection wizard
│   └── adminHandler.js       # Admin PDF upload system
│
├── 📂 storage/               # Empty (for backups)
└── 📂 files/                 # Empty (local file storage)
```

---

## 🔧 Core Files Explanation

### bot.js
**Main entry point of the application**
- Initializes Telegram bot
- Connects to MongoDB
- Registers all command handlers
- Manages graceful shutdown

**Run with:** `npm start`

### config/db.js
**Database connection module**
- Connects to MongoDB using Mongoose
- Handles connection errors
- Provides helpful error messages
- Auto-reconnect logic

### config/cloudinary.js
**Cloud storage integration**
- Uploads PDFs to Cloudinary
- Handles file deletions
- Buffer uploads for Telegram PDFs
- Connection testing

### models/User.js
**User data model**
- Stores user selections (level, semester, subject)
- Tracks flow state
- PDF download history
- Static methods for CRUD operations

### models/Pdf.js
**PDF metadata model**
- Stores PDF information
- Cloudinary URL references
- Links uploads to admins
- Subject categorization

### services/userService.js
**User management logic**
- Get or create users
- Update user selections
- Reset user progress
- Track flow state
- Get user statistics

### services/pdfService.js
**PDF management logic**
- Upload from Telegram
- Upload from file path
- Get PDFs by level/semester
- Filter by subject
- List all PDFs

### handlers/startHandler.js
**Telegram command handlers**
- `/start` - Begin user flow
- `/help` - Show instructions
- `/reset` - Clear selections

### handlers/flowHandler.js
**User selection wizard**
- Handle level buttons
- Handle semester buttons
- Handle subject buttons (3rd year, 2nd sem)
- Send PDFs to users

### handlers/adminHandler.js
**Admin-only operations**
- `/admin` - Admin panel
- `/upload` - Upload PDF
- `/listpdfs` - List all PDFs
- Handle PDF file uploads
- Session management for multi-step flow

---

## 🎯 How Everything Works Together

### User Flow
```
1. User sends /start
   ↓
2. startHandler.js handles the command
   ↓
3. Creates/gets user via userService
   ↓
4. Shows level buttons
   ↓
5. User selects → flowHandler handles callback
   ↓
6. Shows semester buttons
   ↓
7. User selects → Check if 3rd year + 2nd sem?
   ├─ Yes → Show subject buttons
   └─ No → Get PDF directly
   ↓
8. pdfService.getPdfUrl() fetches from MongoDB
   ↓
9. Send PDF to user via Telegram
   ↓
10. Update user in database
```

### Admin Upload Flow
```
1. Admin sends /upload
   ↓
2. adminHandler checks if admin (ADMIN_IDS)
   ↓
3. Show level buttons
   ↓
4. Admin selects → Show semester buttons
   ↓
5. Admin selects → Check if 3rd year + 2nd sem?
   ├─ Yes → Show subject buttons
   └─ No → Wait for PDF
   ↓
6. Admin sends PDF file
   ↓
7. pdfService.uploadFromTelegram() handles:
   - Download from Telegram
   - Upload to Cloudinary
   - Save metadata to MongoDB
   ↓
8. Reply with Cloudinary URL
   ↓
9. PDF available to users
```

---

## 🔐 Security

### Admin System
- Only users in ADMIN_IDS can upload PDFs
- IDs checked in adminHandler.js
- Admin status required for `/admin`, `/upload`, `/listpdfs`

### Environment Variables
- All secrets in `.env` (git-ignored)
- Never commit `.env` to version control
- Use example file for setup

### Database
- MongoDB passwords in connection string
- Mongoose validates all inputs
- Enum validation for fields

---

## 📊 Database Schemas

### User Collection
```javascript
{
  userId: Number,           // Telegram user ID
  level: String,            // first|second|third|fourth
  semester: String,         // first|second
  subject: String,          // nlp|pattern-recognition|...
  pdfUrl: String,          // Last PDF sent
  flowState: String,       // idle|selecting-level|...
  createdAt: Date,
  updatedAt: Date
}
```

### Pdf Collection
```javascript
{
  title: String,           // Display name
  level: String,           // first|second|third|fourth
  semester: String,        // first|second
  subject: String,         // null or subject name
  cloudinaryUrl: String,   // Full Cloudinary URL
  publicId: String,        // Cloudinary public_id
  uploadedBy: Number,      // Admin user ID
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🚀 Starting the Bot

### Prerequisites
```bash
# 1. Install Node.js v18+
# 2. Start MongoDB
# 3. Install dependencies
npm install

# 4. Check setup
npm run setup

# 5. Configure .env
```

### Run Options
```bash
# Development mode
npm start

# Or using npm run
npm run dev
```

### Expected Output
```
========================================
🎓 Educational Telegram Bot Starting...
========================================

✅ Environment variables validated
✅ MongoDB Connected: localhost
   Database: BotData
✅ Cloudinary Connection Test: ok
✅ All handlers registered successfully

🚀 Bot is ready and listening for messages...
```

---

## 📝 Key Features

### For Users
- ✅ Select college level (1st, 2nd, 3rd, 4th year)
- ✅ Select semester (1st, 2nd)
- ✅ For 3rd year 2nd semester: select IT subject
- ✅ Receive PDF based on selection
- ✅ `/reset` to start over
- ✅ `/help` for instructions

### For Admins
- ✅ `/upload` to upload new PDFs
- ✅ Multi-step wizard for categorization
- ✅ Direct PDF upload via Telegram
- ✅ Auto-upload to Cloudinary
- ✅ Store metadata in MongoDB
- ✅ `/listpdfs` to see all uploads

### Technical
- ✅ Clean separation of concerns
- ✅ Service layer pattern
- ✅ Comprehensive error handling
- ✅ MongoDB with Mongoose
- ✅ Cloudinary integration
- ✅ Session management
- ✅ Async/await throughout

---

## 📦 Dependencies

```json
{
  "telegraf": "^4.16.3",      // Telegram Bot API
  "mongoose": "^8.9.4",       // MongoDB ORM
  "cloudinary": "^2.5.1",     // Cloud storage
  "dotenv": "^16.4.7"         // Environment vars
}
```

---

## 🔍 Important Files for Understanding

### Best for Learning Flow
1. Start with `handlers/startHandler.js` - See how commands work
2. Read `handlers/flowHandler.js` - Understand user interactions
3. Check `handlers/adminHandler.js` - Admin system design
4. Study `services/userService.js` - Data management
5. Review `bot.js` - Initialization process

### Best for Integration
1. `config/db.js` - Connect your own MongoDB
2. `config/cloudinary.js` - Upload to cloud storage
3. `models/*.js` - Customize data structure
4. `services/*.js` - Modify business logic

---

## 🛠️ Customization Guide

### Add New Commands
1. Create handler in `handlers/newHandler.js`
2. Import in `bot.js`
3. Register with `registerNewHandlers(bot)`

### Add New PDF Subjects
1. Update enum in `models/Pdf.js`
2. Update enum in `models/User.js`
3. Add buttons in `handlers/adminHandler.js`
4. Add logic in `handlers/flowHandler.js`

### Change Database Name
1. Edit MONGODB_URI in `.env`
2. Restart bot - creates new database

### Add More Admins
1. Edit ADMIN_IDS in `.env`
2. Use format: `ID1,ID2,ID3`
3. No restart needed

---

## ✅ Testing Checklist

- [ ] MongoDB running and connected
- [ ] Telegram token valid
- [ ] Cloudinary credentials correct
- [ ] Admin ID configured
- [ ] `/start` begins user flow
- [ ] `/admin` shows admin panel (if admin)
- [ ] `/upload` works (if admin)
- [ ] PDFs upload to Cloudinary
- [ ] Users receive correct PDFs

---

## 📞 Support

### Common Issues

**Issue: MongoDB not connecting**
- Check MongoDB is running
- Verify MONGODB_URI in .env
- Restart MongoDB service

**Issue: Cloudinary upload fails**
- Verify credentials in .env
- Check no extra spaces
- Test at cloudinary.com/console

**Issue: Bot not responding**
- Check Telegram token is correct
- Verify bot is running
- Check for errors in console

---

## 📚 Further Reading

- [Telegraf Documentation](https://telegraf.js.org/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Telegram Bot API](https://core.telegram.org/bots/api)

---

## 🎉 Next Steps

1. Read [QUICKSTART.md](./QUICKSTART.md) to get running
2. Review [README.md](./README.md) for full details
3. Test with `/start` command
4. Upload your first PDF with `/upload`
5. Customize for your needs

**Happy botting! 🚀**