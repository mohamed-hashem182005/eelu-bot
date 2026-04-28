# 🔧 Cloudinary Setup & Troubleshooting Guide

## ✅ If You See This Message

```
⚠️  Cloudinary configuration issue detected.
   PDF uploads may not work. Check your .env file for:
   - CLOUDINARY_CLOUD_NAME
   - CLOUDINARY_API_KEY
   - CLOUDINARY_API_SECRET
```

This means your Cloudinary credentials are not properly configured. Follow this guide to fix it.

---

## 🚀 Step 1: Create Cloudinary Account

1. **Go to:** https://cloudinary.com/
2. **Click:** "Sign up for free"
3. **Choose:** Email signup
4. **Fill in:** Your email and password
5. **Verify:** Check your email and confirm
6. **Accept:** Terms and create account

---

## 🔑 Step 2: Get Your Credentials

### Find Your Dashboard

1. **Log in** to cloudinary.com
2. **You should see** a dashboard with your credentials
3. **Look for** three important pieces of information:
   - **Cloud Name** (looks like: `djrm7z5x2` or your custom name)
   - **API Key** (looks like: `744218655374389`)
   - **API Secret** (looks like: `NjdNnD-KXrcd3FDO3U6r7xDNDTM`)

### Where to Find Them

**Method 1: Dashboard**
1. Log in to https://cloudinary.com/
2. Look at the top of the page
3. You should see your Cloud Name displayed
4. Copy it

**Method 2: Settings**
1. Click your profile icon (top right)
2. Click "Account Settings"
3. Go to "Account" tab
4. Find "Cloud Name" field
5. Find "API Keys" section below
6. Copy API Key and API Secret

---

## 📝 Step 3: Update Your .env File

Open your `.env` file and find the Cloudinary section:

```env
# ===========================================
# CLOUDINARY CONFIGURATION
# ===========================================
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

Replace the values:

```env
CLOUDINARY_CLOUD_NAME=djrm7z5x2
CLOUDINARY_API_KEY=744218655374389
CLOUDINARY_API_SECRET=NjdNnD-KXrcd3FDO3U6r7xDNDTM
```

### Important Rules

⚠️ **NO spaces around the = sign**
```
✅ CORRECT:   CLOUDINARY_CLOUD_NAME=mycloud
❌ WRONG:     CLOUDINARY_CLOUD_NAME = mycloud
```

⚠️ **NO quotes**
```
✅ CORRECT:   CLOUDINARY_CLOUD_NAME=mycloud
❌ WRONG:     CLOUDINARY_CLOUD_NAME="mycloud"
```

⚠️ **Copy entire strings**
```
✅ CORRECT:   CLOUDINARY_API_KEY=744218655374389
❌ WRONG:     CLOUDINARY_API_KEY=7442186 (incomplete)
```

---

## ✔️ Step 4: Verify Configuration

Run the diagnostic tool:

```bash
npm run diagnose
```

You should see:

```
✅ Cloud Name: ✓ configured
✅ API Key: ✓ configured
✅ API Secret: ✓ configured

ℹ️  Verify at: https://cloudinary.com/console
```

---

## 🚀 Step 5: Restart the Bot

```bash
# Stop the bot (Ctrl + C if running)

# Start again
npm start
```

You should see:

```
✅ Cloudinary Configuration: valid
✅ All handlers registered successfully

🚀 Bot is ready and listening for messages...
```

---

## ❌ Troubleshooting

### Error: "Cloudinary Configuration: Missing credentials in .env"

**Cause:** One or more values are missing or empty

**Solution:**
1. Open `.env` file
2. Check all three Cloudinary lines have values
3. Make sure no values are empty
4. Make sure values don't start with `your_` or `example`

### Error: "Cloudinary Configuration: Invalid"

**Cause:** Credentials are configured but not recognized

**Solution:**
1. Double-check you copied the ENTIRE values from Cloudinary
2. Look for extra spaces before/after values
3. Make sure you're using your actual Cloudinary account, not demo

### Bot Starts But Shows Warning

**This is OK!** The bot will still work. Warning means:
- Credentials are configured
- But Cloudinary API isn't being tested actively
- PDF uploads will still work when you use `/upload`

### PDFs Upload But Users Can't Download

**This usually means:**
1. PDFs were uploaded to Cloudinary ✓
2. URLs are in MongoDB ✓
3. But bot can't retrieve them

**Solutions:**
1. Check PDF URLs in MongoDB
2. Make sure URLs are complete and valid
3. Test URL in browser: paste the Cloudinary URL in address bar
4. It should download the PDF

---

## 🧪 Test Cloudinary Upload

### Admin Test Upload

1. **Start bot:** `npm start`
2. **Go to Telegram:** Find your bot
3. **Send:** `/admin` command
4. **Follow:** The upload wizard
5. **Select:** Any level and semester
6. **Send:** A small PDF file
7. **Watch:** For success message with URL

### Expected Success Response

```
✅ PDF Uploaded Successfully!

Title: First Year - First Semester
Level: first
Semester: first
Subject: N/A

🔗 Cloudinary URL:
https://res.cloudinary.com/your-cloud-name/raw/upload/v1234567890/edu-bot/pdfs/example.pdf
```

---

## 🔒 Security Tips

### Keep Your Secrets Safe

⚠️ **NEVER share your credentials:**
- ❌ Don't push `.env` to GitHub
- ❌ Don't send credentials in messages
- ❌ Don't post them in forums
- ❌ Don't share screenshots with credentials

### .gitignore Protection

Your project has `.env` in `.gitignore` (should be there automatically).

If not, create a `.gitignore` file:
```
.env
node_modules/
*.log
.DS_Store
```

### API Key Rotation

If you accidentally share your API Secret:
1. Go to Cloudinary Settings
2. Click "Generate" next to API Secret
3. Update your `.env` with new Secret
4. Restart bot

---

## 📊 Cloudinary File Limits (Free Tier)

- **Storage:** 25 GB
- **Uploads:** 25 GB per month
- **File Types:** All formats supported
- **Delivery:** Unlimited bandwidth

For PDFs: You'll have plenty of space!

---

## 📚 Cloudinary Features for Your Bot

### What's Already Set Up

```javascript
// Upload PDFs to Cloudinary
uploadFromTelegram(bot, fileId, metadata, uploadedBy)

// Delete PDFs
deleteFile(publicId)

// Store URLs in MongoDB
Pdf.cloudinaryUrl = "https://res.cloudinary.com/..."
```

### Folder Structure

All your PDFs go to: `edu-bot/pdfs/`

You can see them in:
- Cloudinary Dashboard → Media Library
- Filter by: Folder "edu-bot/pdfs"

### File Organization

PDFs are named like:
```
first_first_main_1234567890.pdf
third_second_nlp_1234567890.pdf
second_first_main_1234567890.pdf
```

Format: `{level}_{semester}_{subject}_[timestamp].pdf`

---

## ✅ Complete Checklist

- [ ] Created Cloudinary account
- [ ] Copied Cloud Name
- [ ] Copied API Key
- [ ] Copied API Secret
- [ ] Updated `.env` file
- [ ] No spaces around `=` signs
- [ ] No quotes around values
- [ ] Ran `npm run diagnose` (all ✅)
- [ ] Restarted bot with `npm start`
- [ ] See "Cloudinary Configuration: valid" message
- [ ] Test uploaded a PDF with `/upload`
- [ ] Test downloaded a PDF with `/start`

---

## 🆘 Still Having Issues?

1. **Run diagnostic:** `npm run diagnose`
2. **Check errors:** Look at console output
3. **Review .env:** Verify credentials are correct
4. **Test credentials:** Log into cloudinary.com/console
5. **Check dashboard:** Ensure your account is active

---

## 📞 Quick Links

- **Cloudinary Dashboard:** https://cloudinary.com/console
- **Account Settings:** https://cloudinary.com/settings/account
- **API Documentation:** https://cloudinary.com/documentation/admin_api

---

## ✨ You're All Set!

Once Cloudinary is configured:
- ✅ Admins can upload PDFs
- ✅ PDFs store in cloud (Cloudinary)
- ✅ Users download from cloud
- ✅ Database only stores URLs (efficient)
- ✅ Unlimited scalability

**Happy uploading! 🚀**