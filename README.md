# 🎓 Educational Telegram Bot

A smart educational Telegram bot for IT students that provides PDF study materials based on college level and semester selection.

## 📋 Features

- **Interactive Wizard Flow**: Step-by-step selection of college level and semester
- **Smart Subject Selection**: Third-year second semester students can select specific IT subjects
- **PDF Distribution**: Send PDF files based on user selection
- **Admin System**: Admins can upload PDFs directly via Telegram
- **MongoDB Storage**: Store user data and PDF metadata
- **Cloudinary Integration**: Cloud storage for PDF files
- **Commands**:
  - `/start` - Start the conversation flow
  - `/reset` - Reset and restart the flow
  - `/help` - Show help instructions
  - `/admin` - Open admin panel (admins only)
  - `/upload` - Upload a PDF (admins only)
  - `/listpdfs` - List all uploaded PDFs (admins only)

## 🏗️ Project Structure

```
project/
├── bot.js                    # Main bot entry point
├── config/
│   ├── db.js                # MongoDB connection
│   └── cloudinary.js        # Cloudinary configuration
├── models/
│   ├── User.js              # User model
│   └── Pdf.js               # PDF metadata model
├── services/
│   ├── userService.js       # User management service
│   └── pdfService.js        # PDF management service
├── handlers/
│   ├── startHandler.js      # Start/help/reset command handlers
│   ├── flowHandler.js       # User wizard flow handlers
│   └── adminHandler.js      # Admin upload handlers
├── storage/                 # Empty (backups/temp)
├── files/                   # Empty (local file storage)
├── .env                     # Environment variables
├── package.json             # Dependencies
└── README.md                # This file
```

## 🚀 Installation

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Set Up MongoDB

**Choose ONE option:**

#### ✅ Option A: Local MongoDB (Recommended for Development)

**Windows:**
1. Download MongoDB Community Server: https://www.mongodb.com/try/download/community
2. Run the installer and follow the setup wizard
3. MongoDB will be installed as a Windows service and automatically started
4. Verify installation: `mongod --version`
5. The local MongoDB will be running at `mongodb://localhost:27017`

**Mac:**
```bash
# Install MongoDB using Homebrew
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB service
brew services start mongodb-community

# Stop MongoDB (when needed)
brew services stop mongodb-community
```

**Linux (Ubuntu/Debian):**
```bash
# Install MongoDB
sudo apt-get update
sudo apt-get install -y mongodb

# Start MongoDB
sudo systemctl start mongodb
sudo systemctl enable mongodb

# Verify it's running
sudo systemctl status mongodb
```

#### ✅ Option B: MongoDB Atlas (Cloud - Free Tier)

1. Create a free account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster (free tier available)
3. Go to "Database Access" and add a user with password
4. Go to "Network Access" and add your IP address (or 0.0.0.0/0 for all)
5. Click "Connect" and copy the connection string
6. Replace the MONGODB_URI in `.env` with your connection string
7. Make sure to include your username and password in the URI

**Example MongoDB Atlas URI:**
```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/database_name?retryWrites=true&w=majority
```

### Step 3: Configure Environment Variables

Edit the `.env` file with your credentials:

```env
# Your Telegram Bot Token (from @BotFather)
TELEGRAM_BOT_TOKEN=your_bot_token

# MongoDB Connection (local or cloud)
MONGODB_URI=mongodb://localhost:27017/BotData

# Cloudinary credentials (from cloudinary.com dashboard)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Your Telegram user ID (from @userinfobot)
ADMIN_IDS=your_telegram_id
```

### Step 4: Get Your Telegram Bot Token

1. Open Telegram and search for **@BotFather**
2. Send `/newbot` command
3. Give it a name and username
4. Copy the API token
5. Paste it in `.env` as `TELEGRAM_BOT_TOKEN`

### Step 5: Get Your Telegram User ID

1. Open Telegram and search for **@userinfobot**
2. Send any message
3. Get your user ID and add it to `ADMIN_IDS` in `.env`

### Step 6: Get Cloudinary Credentials

1. Sign up at https://cloudinary.com/ (free tier available)
2. Go to your Dashboard
3. Copy:
   - Cloud Name
   - API Key
   - API Secret
4. Paste them in `.env`

## 📤 How to Upload PDFs to Cloudinary

### Option 1: Via Cloudinary Dashboard

1. Log in to https://cloudinary.com/
2. Go to Media Library
3. Click "Upload" button
4. Select your PDF files
5. Note the secure_url for each file

### Option 2: Programmatic Upload

You can create a script to upload PDFs:

```javascript
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

// Configure
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload PDF
const result = await cloudinary.uploader.upload('./files/your-file.pdf', {
  resource_type: 'raw',
  folder: 'edu-bot/pdfs'
});

console.log('Upload result:', result.secure_url);
```

## 🔗 How to Link PDFs to Database

After uploading PDFs to Cloudinary, you need to store their URLs in MongoDB. 

### Method 1: Using a Seed Script

Create a `seed.js` file:

```javascript
require('dotenv').config();
const mongoose = require('mongoose');
const Pdf = require('./models/Pdf');

const pdfData = [
  {
    title: 'First Year First Semester',
    level: 'first',
    semester: 'first',
    cloudinaryUrl: 'https://your-cloudinary-url.pdf',
    subjectList: []
  },
  // Add more PDFs...
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  await Pdf.deleteMany({});
  await Pdf.insertMany(pdfData);
  console.log('Database seeded!');
  process.exit();
}

seed();
```

Run with: `node seed.js`

### Method 2: Manual Insertion

You can also insert PDFs directly using MongoDB shell or Compass:

```javascript
use edu-bot;
db.pdfs.insertOne({
  title: "Third Year Second Semester - IT",
  level: "third",
  semester: "second",
  cloudinaryUrl: "https://res.cloudinary.com/your-cloud/raw/upload/v1234567890/edu-bot/pdfs/nlp.pdf",
  subjectList: ["NLP", "Pattern Recognition", "Advanced Software Engineering", "Microcontrollers", "Information Security", "Ethical Hacking"]
});
```

## 🎯 How It Works

### User Flow

1. User sends `/start`
2. Bot asks: "Select your college level:"
   - First Year
   - Second Year
   - Third Year
   - Fourth Year
3. User selects level
4. Bot asks: "Select your semester:"
   - First Semester
   - Second Semester
5. User selects semester
6. **If Third Year + Second Semester**: Bot shows IT subjects:
   - NLP
   - Pattern Recognition
   - Advanced Software Engineering
   - Microcontrollers
   - Information Security
   - Ethical Hacking
7. User selects subject
8. Bot sends the corresponding PDF

### Database Schema

**User Collection:**
```javascript
{
  userId: Number,
  level: String,
  semester: String,
  pdfUrl: String,
  createdAt: Date,
  updatedAt: Date
}
```

**PDF Collection:**
```javascript
{
  title: String,
  level: String,
  semester: String,
  cloudinaryUrl: String,
  subjectList: [String],
  createdAt: Date
}
```

## 🏃 Running the Bot

### Prerequisites Checklist

Before running the bot, make sure you have:

- ✅ Node.js installed (v18 or higher)
- ✅ npm dependencies installed (`npm install`)
- ✅ `.env` file configured with all credentials
- ✅ **MongoDB running** (local or Atlas)
- ✅ Cloudinary account set up

### Verify MongoDB is Running

**Windows:**
```bash
# Check if MongoDB service is running
tasklist | find "mongod"

# If not running, start it (should auto-start)
# Or open Services and start "MongoDB" service manually
```

**Mac:**
```bash
# Check if MongoDB is running
brew services list | grep mongodb

# Start MongoDB if it's not running
brew services start mongodb-community
```

**Linux:**
```bash
# Check if MongoDB is running
sudo systemctl status mongodb

# Start MongoDB if it's not running
sudo systemctl start mongodb
```

**Verify Connection:**
```bash
# Test local MongoDB connection
mongosh --host localhost:27017

# You should see the MongoDB shell
# Type: exit
```

### Start the Bot

```bash
# Start the bot
npm start
```

You should see output like:
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

### If MongoDB is NOT Running

You'll see an error like:
```
❌ MongoDB Connection Failed: ...
⚠️ TROUBLESHOOTING:
1. Make sure MongoDB is running on your system
2. For Windows: Start MongoDB Community Server service
3. ...
```

**Solution:**
1. Start MongoDB service (see instructions above)
2. Run `npm start` again

### Testing the Bot

1. **Start the bot:** `npm start`
2. **Open Telegram** and find your bot
3. **Send `/start`** command to test the user flow
4. **Send `/admin`** to test admin panel
5. **Send `/help`** for instructions

### Common Commands

| Command | Description | Who Can Use |
|---------|-------------|------------|
| `/start` | Begin the PDF selection flow | Anyone |
| `/reset` | Reset and start over | Anyone |
| `/help` | Show help instructions | Anyone |
| `/admin` | Open admin panel | Admins only |
| `/upload` | Upload a PDF file | Admins only |
| `/listpdfs` | List all uploaded PDFs | Admins only |

### Admin Flow (PDF Upload)

1. Send `/upload` command
2. Select college level (First, Second, Third, Fourth)
3. Select semester (First, Second)
4. If Third Year + Second Semester, select an IT subject
5. Send the PDF file
6. Bot uploads to Cloudinary and saves to MongoDB
7. Get the Cloudinary URL in the response

### User Flow (PDF Download)

1. Send `/start`
2. Select your college level
3. Select your semester
4. For Third Year Second Semester: select your subject
5. Receive the PDF file

## 📝 Available PDF Mappings

| Level | Semester | Subject | PDF |
|-------|----------|---------|-----|
| First | First | - | first-year-1st-sem.pdf |
| First | Second | - | first-year-2nd-sem.pdf |
| Second | First | - | second-year-1st-sem.pdf |
| Second | Second | - | second-year-2nd-sem.pdf |
| Third | First | - | third-year-1st-sem.pdf |
| Third | Second | NLP | nlp.pdf |
| Third | Second | Pattern Recognition | pattern-recognition.pdf |
| Third | Second | Advanced Software Engineering | ase.pdf |
| Third | Second | Microcontrollers | microcontrollers.pdf |
| Third | Second | Information Security | info-security.pdf |
| Third | Second | Ethical Hacking | ethical-hacking.pdf |
| Fourth | First | - | fourth-year-1st-sem.pdf |
| Fourth | Second | - | fourth-year-2nd-sem.pdf |

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| TELEGRAM_BOT_TOKEN | Telegram Bot API Token | Yes |
| MONGODB_URI | MongoDB Connection String | Yes |
| CLOUDINARY_CLOUD_NAME | Cloudinary Cloud Name | Yes |
| CLOUDINARY_API_KEY | Cloudinary API Key | Yes |
| CLOUDINARY_API_SECRET | Cloudinary API Secret | Yes |

## 🛡️ Error Handling

The bot includes comprehensive error handling:
- Database connection errors
- Cloudinary upload errors
- Invalid user input handling
- Graceful degradation

## ❌ Troubleshooting

### Error: "MongoDB Connection Failed: ECONNREFUSED"

**Cause:** MongoDB is not running

**Solutions:**

**Windows:**
```bash
# Check if MongoDB is running
tasklist | find "mongod"

# Start MongoDB service
# Go to Services (services.msc) and start "MongoDB Server"
# OR if using Windows, MongoDB should auto-start
```

**Mac:**
```bash
# Check status
brew services list

# Start MongoDB
brew services start mongodb-community

# Verify it's running
brew services list | grep mongodb
```

**Linux:**
```bash
# Check status
sudo systemctl status mongodb

# Start MongoDB
sudo systemctl start mongodb
```

---

### Error: "Cloudinary Upload Error" or "Cloudinary Connection Test Failed"

**Cause:** Invalid Cloudinary credentials

**Solutions:**
1. Go to https://cloudinary.com/console
2. Copy the correct credentials from your dashboard:
   - Cloud Name
   - API Key
   - API Secret
3. Update `.env` with correct values
4. Make sure there are no extra spaces in the `.env` file

---

### Error: "❌ You are not authorized to use admin commands"

**Cause:** Your Telegram user ID is not in ADMIN_IDS

**Solutions:**
1. Open Telegram and search for **@userinfobot**
2. Send any message to get your user ID
3. Update `ADMIN_IDS` in `.env`
4. Restart the bot

---

### Error: "querySrv ECONNREFUSED" with MongoDB Atlas

**Cause:** Network/firewall issue or invalid credentials

**Solutions:**
1. Check your MongoDB Atlas credentials in the connection string
2. Make sure your IP is whitelisted in MongoDB Atlas:
   - Go to Network Access in MongoDB Atlas
   - Add your current IP or 0.0.0.0/0 (allow all)
3. Make sure the URI is correct with username and password
4. Test the connection in MongoDB Compass

---

### Bot Not Responding

**Check:**
1. Bot is running: `npm start` should show "🚀 Bot is ready..."
2. Telegram token is correct in `.env`
3. MongoDB is connected: should see "✅ MongoDB Connected"
4. Check bot is added to your contacts

**Solution:**
```bash
# Kill the bot process
Ctrl + C

# Start again
npm start
```

---

### Cannot Upload PDFs

**Cause:** Not an admin or Cloudinary credentials invalid

**Check:**
1. Are you admin? (check ADMIN_IDS in .env)
2. Use `/admin` command first
3. Then use `/upload` command
4. Cloudinary credentials are valid

**Solution:**
- Verify credentials at https://cloudinary.com/console
- Restart bot after changing .env

---

### Database Not Saving Data

**Check:**
1. MongoDB is running and connected
2. .env has correct MONGODB_URI
3. Database name is correct (BotData)

**Solution:**
```bash
# Test MongoDB connection
mongosh --host localhost:27017

# Check if BotData database exists
use BotData
db.users.find()
db.pdfs.find()
```

---

## 📚 Quick Start Summary

```bash
# 1. Install dependencies
npm install

# 2. Start MongoDB (choose based on your OS)
# Windows: Start MongoDB service from Services
# Mac: brew services start mongodb-community
# Linux: sudo systemctl start mongodb

# 3. Configure .env with your credentials

# 4. Start the bot
npm start

# 5. Open Telegram and test /start command
```

## 📦 Dependencies

- **telegraf** - Telegram Bot API framework
- **mongoose** - MongoDB object modeling
- **cloudinary** - Cloud storage SDK
- **dotenv** - Environment variable management

## 📄 License

ISC

## 🤝 Contributing

Feel free to submit issues and pull requests!