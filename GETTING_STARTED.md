# 🎯 GETTING STARTED - Step by Step

## The Problem You Just Saw

```
❌ MongoDB Connection Failed: querySrv ECONNREFUSED _mongodb._tcp.cluster0.57dvtru.mongodb.net
```

**This means MongoDB is not running and needs to be started.**

---

## Solution: 3 Simple Steps

### Step 1️⃣: Start MongoDB (Windows)

**Open the Services Manager:**
1. Press `Win + R`
2. Type `services.msc` and press Enter
3. Find **MongoDB Server** in the list
4. Right-click on it → Click **Start**
5. Status should change to "Running"

**OR if you have MongoDB Community Edition installed:**
1. Type `mongod` in PowerShell (or Command Prompt)
2. You should see output like:
```
2024-04-28T10:00:00.000+0000 I CONTROL [main] Automatically enabled experimental feature PeriodicNoopWritesInSharded
2024-04-28T10:00:00.000+0000 I CONTROL [main] --omitReceipt has been set, skipping receipt generation
2024-04-28T10:00:00.000+0000 I STORAGE [initandlisten] mongodb starting v5.0.10...
```

If you see this, MongoDB is running! ✅

### Step 2️⃣: Verify MongoDB is Running

Open a **NEW PowerShell window** and type:
```bash
mongosh --host localhost:27017
```

You should see:
```
Current Mongosh Log ID:  ...
Connecting to:          mongodb://localhost:27017/?directConnection=true
MongoServerError: connect ECONNREFUSED ...
```

Or a successful connection:
```
test> _
```

If you get a prompt, MongoDB is running! ✅

Type `exit` to quit.

### Step 3️⃣: Start the Bot

In your project directory, run:
```bash
npm start
```

You should see:
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

**If you see this, the bot is running! 🎉**

---

## Troubleshooting Each Step

### MongoDB Won't Start

**Error: "Service failed to start"**

**Solution 1: Reinstall MongoDB**
```powershell
# Download from: https://www.mongodb.com/try/download/community
# Run installer, select "Complete" setup
# It will auto-start the MongoDB Server service
```

**Solution 2: Use alternative - MongoDB Atlas (Cloud)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up (free)
3. Create a cluster
4. Get connection string
5. Update `.env` with Atlas URI
6. Restart bot

### MongoDB Running but Bot Still Fails

**Check 1: MongoDB is actually listening**
```powershell
netstat -an | findstr 27017
```

You should see something like:
```
TCP    127.0.0.1:27017       LISTENING
```

**Check 2: .env file is correct**
```env
MONGODB_URI=mongodb://localhost:27017/BotData
```

Make sure there are NO spaces around the `=` sign!

**Check 3: Try connecting with mongosh**
```bash
mongosh --host localhost:27017 --username admin --password password
```

If mongosh works but bot doesn't, the issue is in bot code (contact support).

---

## If You Still Have Issues

### Check Each Requirement

```powershell
# 1. Check Node.js is installed
node --version
# Should output v18 or higher

# 2. Check npm dependencies are installed
npm list
# Should show telegraf, mongoose, cloudinary, dotenv

# 3. Check .env exists and has values
cat .env
# Should show TELEGRAM_BOT_TOKEN, MONGODB_URI, etc.

# 4. Check MongoDB is running
tasklist | findstr mongod
# Should show mongod process

# 5. Run setup checker
npm run setup
# Should show green checkmarks
```

### Run the Setup Checker

```bash
npm run setup
```

This will show:
```
✅ Check 1: Node.js Version
   Current: v18.x.x
✅ Check 2: Dependencies
   Dependencies installed: 4
✅ Check 3: Environment Variables
   ✅ TELEGRAM_BOT_TOKEN
   ✅ MONGODB_URI
   ... etc ...
✅ Check 4: Project Structure
   ✅ bot.js
   ✅ config/db.js
   ... etc ...
```

All green? You're ready! 🚀

---

## Quick Reference

### Ports Used
- MongoDB: **27017** (local)
- Telegram: Cloud-based (no local port)
- Cloudinary: Cloud-based (no local port)

### Required Services
| Service | Where | Check |
|---------|-------|-------|
| MongoDB | Local or Cloud | `mongosh --host localhost:27017` |
| Telegram Bot | Cloud | Check Telegram app |
| Cloudinary | Cloud | cloudinary.com/console |

### Commands to Remember

```bash
# Start bot
npm start

# Check setup
npm run setup

# Check dependencies
npm list

# Check mongoDB
mongosh --host localhost:27017

# Stop bot
Ctrl + C
```

---

## Testing the Bot

Once the bot is running:

1. **Open Telegram**
2. **Find your bot** (search by username)
3. **Send `/start`** - should show level buttons
4. **Select a level** - should show semester options
5. **Select a semester** - should ask for subject or send PDF

If all this works, you're done! 🎉

---

## Next Steps

1. ✅ Bot running
2. ✅ User can select level/semester
3. ➡️ **Upload your first PDF:**
   - Use `/admin` command
   - Go through upload flow
   - Send a test PDF
4. ➡️ **Users can download PDFs:**
   - New users will get the PDF you uploaded
   - Data saves to MongoDB

---

## Need More Help?

### Documentation Files
- **QUICKSTART.md** - 5-minute guide
- **README.md** - Full documentation
- **INDEX.md** - Complete reference

### Common Commands

**For Users:**
- `/start` - Begin selection
- `/reset` - Clear selections
- `/help` - Get help

**For Admins (you):**
- `/admin` - Open admin panel
- `/upload` - Upload PDF
- `/listpdfs` - See all PDFs

---

## You're All Set! 🚀

The bot is production-ready and includes:
- ✅ Admin PDF upload system
- ✅ User level/semester selection
- ✅ MongoDB database
- ✅ Cloudinary cloud storage
- ✅ Complete error handling
- ✅ Professional logging

**Start using it today!**