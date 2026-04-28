# 🚀 QUICK START GUIDE

## Step 1: Install Dependencies
```bash
npm install
```

## Step 2: Start MongoDB

**Windows:**
- Open Services (services.msc)
- Find "MongoDB Server"
- Right-click → Start (or it should auto-start)

**Mac:**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongodb
```

## Step 3: Check MongoDB is Running
```bash
mongosh --host localhost:27017
```
You should see the MongoDB shell prompt. Type `exit` to quit.

## Step 4: Configure Environment Variables

Edit `.env` and add your credentials:

```env
TELEGRAM_BOT_TOKEN=your_bot_token_from_BotFather
MONGODB_URI=mongodb://localhost:27017/BotData
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
ADMIN_IDS=your_telegram_user_id
```

### Get Your Credentials:

1. **Telegram Bot Token:**
   - Open Telegram, search for @BotFather
   - Send `/newbot`
   - Copy the token

2. **Telegram User ID:**
   - Open Telegram, search for @userinfobot
   - Send any message
   - Copy your ID

3. **Cloudinary Credentials:**
   - Go to https://cloudinary.com/
   - Sign up (free)
   - Go to Dashboard
   - Copy Cloud Name, API Key, API Secret

4. **MongoDB:**
   - Running locally? Use: `mongodb://localhost:27017/BotData`
   - Using Atlas? Use your connection string

## Step 5: Verify Setup

```bash
node setup.js
```

This will check if everything is configured correctly.

## Step 6: Start the Bot

```bash
npm start
```

You should see:
```
========================================
🎓 Educational Telegram Bot Starting...
========================================

✅ MongoDB Connected: localhost
✅ Cloudinary Connection Test: ok
✅ All handlers registered successfully

🚀 Bot is ready and listening for messages...
```

## Step 7: Test in Telegram

1. Open Telegram
2. Search for your bot (using the username you created)
3. Send `/start` to begin
4. Test `/help` for instructions
5. Send `/admin` if you're an admin to upload PDFs

---

## ⚠️ Common Issues

### MongoDB Not Running
```
Error: MongoDB Connection Failed: ECONNREFUSED
```
**Solution:** Start MongoDB service (see Step 2 above)

### Invalid Cloudinary Credentials
```
Error: Cloudinary Connection Test Failed
```
**Solution:** Check your credentials at cloudinary.com/console

### Bot Not Responding
```
Bot appears offline
```
**Solution:** 
- Check bot token in .env
- Restart bot: Ctrl+C, then npm start

### Cannot Upload PDF
**Solution:**
- Are you admin? Check ADMIN_IDS in .env
- Use `/admin` first, then `/upload`

---

## 📚 Full Documentation

See `README.md` for:
- Complete installation guide
- Admin system features
- User flow explanation
- Database schemas
- Troubleshooting guide
- API reference

---

## ✅ You're Done!

The bot is now running and ready to:
- ✅ Accept user level/semester selections
- ✅ Send PDFs based on selections
- ✅ Allow admins to upload PDFs
- ✅ Store data in MongoDB
- ✅ Upload files to Cloudinary

**Happy coding! 🎉**