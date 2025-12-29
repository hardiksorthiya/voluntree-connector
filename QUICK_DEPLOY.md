# 🚀 Quick Deployment Guide - Hostinger

## Your Credentials
- **SSH**: u605696782@157.173.214.77:65002
- **Database**: mysql / u605696782_volunteer / Volunteer@@123

---

## Fast Track Deployment (5 Steps)

### Step 1: Build Frontend Locally
```bash
cd frontend
npm install
npm run build
```
✅ You now have a `build` folder ready to upload

### Step 2: Upload Files via FTP
**Use FileZilla or WinSCP:**
- Host: `157.173.214.77` or `ftp.volunteerconnect.io`
- User: `u605696782`
- Pass: `Volunteer@@123`

**Upload:**
- `backend/` folder → `/public_html/backend/`
- `frontend/build/*` → `/public_html/` (all files from build folder)

### Step 3: Setup Backend on Server

**Connect via SSH or hPanel Terminal:**
```bash
cd ~/public_html/backend

# Install dependencies
npm install --production

# Create .env file
nano .env
```

**Paste this (generate JWT_SECRET first):**
```env
PORT=3000
NODE_ENV=production
DB_HOST=mysql
DB_USER=u605696782_volunteer
DB_PASSWORD=Volunteer@@123
DB_NAME=u605696782_volunteer
DB_PORT=3306
JWT_SECRET=GENERATE_BELOW
JWT_EXPIRE=7d
CORS_ORIGIN=https://volunteerconnect.io
```

**Generate JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```
Copy output and replace `GENERATE_BELOW` in .env

**Save .env**: `Ctrl+X`, `Y`, `Enter`

**Run migrations:**
```bash
npm run migrate
```

### Step 4: Start Backend

**Option A: PM2 (Best)**
```bash
npm install -g pm2
pm2 start server.js --name volunteerconnect-api
pm2 save
pm2 startup
```

**Option B: Hostinger Node.js App Manager**
1. hPanel → Node.js → Create App
2. App root: `/home/u605696782/public_html/backend`
3. Startup: `server.js`
4. Add environment variables from .env
5. Start app

### Step 5: Create .htaccess for Frontend
```bash
nano ~/public_html/.htaccess
```

**Paste:**
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

---

## ✅ Test Your Deployment

1. **API Health**: https://volunteerconnect.io/api/health
2. **API Docs**: https://volunteerconnect.io/api-docs
3. **Frontend**: https://volunteerconnect.io

---

## 🔧 Quick Fixes

**Backend not working?**
```bash
pm2 logs volunteerconnect-api
pm2 restart volunteerconnect-api
```

**Database error?**
```bash
# Test connection
mysql -h mysql -u u605696782_volunteer -p u605696782_volunteer
# Password: Volunteer@@123
```

**Frontend not loading?**
- Check if `index.html` is in `public_html`
- Verify `.htaccess` exists
- Check file permissions

---

## 📱 Update Mobile App

Edit `mobile/src/config/api.js`:
```javascript
const API_BASE_URL = 'https://volunteerconnect.io/api';
```

Then rebuild your mobile app.

---

**Need help?** See `DEPLOYMENT_HOSTINGER.md` for detailed instructions.

