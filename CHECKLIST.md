# ✅ ACTION CHECKLIST - Get Your Bot Running in 15 Minutes

## Pre-Check (2 minutes)

- [ ] MongoDB is running
  - Windows: Services → MongoDB Server → Running?
  - Mac: `brew services list | grep mongodb`
  - Linux: `sudo systemctl status mongodb`

- [ ] Node.js is installed
  - Run: `node --version` (should show v18+)

- [ ] Dependencies installed
  - Run: `npm list | head -20`

---

## Fix Cloudinary (5 minutes)

Follow this **exactly**:

1. [ ] Go to: https://cloudinary.com/
2. [ ] Click "Sign up for free"
3. [ ] Create account (email + password)
4. [ ] Go to: https://cloudinary.com/console (dashboard)
5. [ ] Find and copy:
   - [ ] `CLOUDINARY_CLOUD_NAME` (top right area)
   - [ ] `CLOUDINARY_API_KEY` (Settings → Account)
   - [ ] `CLOUDINARY_API_SECRET` (Settings → Account)

6. [ ] Edit `.env` file:
   ```env
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

7. [ ] Save `.env` file

---

## Verify Setup (2 minutes)

1. [ ] Run: `npm run diagnose`
2. [ ] Check output for:
   - ✅ Node.js version: v18+
   - ✅ Dependencies: all 4 installed
   - ✅ .env file: exists
   - ✅ TELEGRAM_BOT_TOKEN: configured
   - ✅ MONGODB_URI: configured
   - ✅ CLOUDINARY: all 3 configured
   - ✅ ADMIN_IDS: configured

---

## Start Bot (2 minutes)

1. [ ] Stop any running bot: `Ctrl + C`
2. [ ] Run: `npm start`
3. [ ] Look for:
   ```
   ✅ MongoDB Connected
   ✅ Cloudinary Configuration: valid
   ✅ All handlers registered
   🚀 Bot is ready and listening for messages...
   ```

4. [ ] If you see all ✅ marks → **Bot is running!** 🎉

---

## Test Bot (3 minutes)

1. [ ] Open Telegram
2. [ ] Find your bot (search by username)
3. [ ] Send: `/start`
4. [ ] You should see: Level selection buttons (First, Second, Third, Fourth year)
5. [ ] Click a level
6. [ ] You should see: Semester selection buttons (First, Second)
7. [ ] Click a semester
8. [ ] Expected:
   - If 3rd year + 2nd sem → Show subject buttons
   - Otherwise → Bot sends a PDF (or says no PDF available)

✅ **If this works, your bot is alive!**

---

## Test Admin Upload (1 minute)

Only if you're in ADMIN_IDS:

1. [ ] In Telegram, send: `/admin`
2. [ ] You should see: Admin panel message
3. [ ] If you see error "not authorized" → Add your ID to ADMIN_IDS in .env and restart

---

## Troubleshooting Checklist

### Bot won't start
- [ ] MongoDB running?
- [ ] Node.js v18+?
- [ ] Dependencies installed? (`npm install`)
- [ ] .env file exists?
- [ ] No syntax errors in .env?

### Still failing?
```bash
npm run diagnose
```
Look at the output and fix any ❌ items

### Cloudinary still showing warning?
- [ ] All 3 Cloudinary values in .env?
- [ ] No spaces around `=` sign?
- [ ] No quotes around values?
- [ ] Exact copy from cloudinary.com/console?

---

## Final Verification

```bash
# Run this command
npm run diagnose

# You should see mostly ✅ and 0 ❌
```

---

## You're Done! 🎉

Your bot is now:
- ✅ Connected to MongoDB
- ✅ Connected to Cloudinary
- ✅ Listening for user commands
- ✅ Ready to distribute PDFs
- ✅ Ready for admin uploads

---

## Next: Read Documentation

- **Quick questions?** → QUICKSTART.md
- **Step-by-step help?** → GETTING_STARTED.md
- **Cloudinary issues?** → CLOUDINARY_SETUP.md
- **Full reference?** → README.md

---

## Commands to Remember

```bash
npm start          # Start the bot
npm run diagnose   # Check everything
npm run setup      # Pre-flight check

# In Telegram:
/start   # User selects level/semester
/reset   # Clear selections
/help    # Show help
/admin   # Admin panel (admins only)
/upload  # Upload PDF (admins only)
/listpdfs # List all PDFs (admins only)
```

---

## Emergency Commands

```bash
# Stop the bot
Ctrl + C

# Check if MongoDB is running
mongosh --host localhost:27017

# Check Node.js version
node --version

# Reinstall dependencies
rm -r node_modules
npm install
```

---

**Start now:**
```bash
npm start
```

**Then test in Telegram:**
- Send `/start`
- Select a level
- Done! ✅

---

**Good luck! 🚀**