# Quick Deployment Guide - Hostinger Production

## Your Server Details
- **SSH IP**: 157.173.214.77
- **SSH Port**: 65002
- **SSH Username**: u605696782
- **SSH Password**: Volunteer@@123
- **Database Host**: mysql
- **Database Name**: u605696782_volunteer
- **Database User**: u605696782_volunteer
- **Database Password**: Volunteer@@123

---

## Step 1: Connect to Server

### Option A: Using SSH (if you have SSH access enabled)
```bash
ssh -p 65002 u605696782@157.173.214.77
# Enter password: Volunteer@@123
```

### Option B: Using Hostinger hPanel Terminal
1. Log in to Hostinger hPanel
2. Go to **Advanced** → **Terminal**
3. You'll have a web-based terminal

---

## Step 2: Prepare Project Files

### On Your Local Machine:

1. **Build Frontend for Production:**
```bash
cd frontend
npm install
npm run build
```
This creates a `build` folder with production-ready files.

2. **Prepare Backend:**
```bash
cd backend
# Make sure all dependencies are in package.json
npm install
```

---

## Step 3: Upload Files to Server

### Option A: Using FTP/SFTP (FileZilla, WinSCP, etc.)

**FTP Settings:**
- Host: `157.173.214.77` or `ftp.volunteerconnect.io`
- Port: `21` (FTP) or `22` (SFTP)
- Username: `u605696782`
- Password: `Volunteer@@123`

**Upload Structure:**
```
/public_html/ (or /domains/volunteerconnect.io/public_html/)
├── backend/          (upload entire backend folder)
│   ├── config/
│   ├── middleware/
│   ├── migrations/
│   ├── routes/
│   ├── scripts/
│   ├── public/
│   ├── server.js
│   ├── package.json
│   └── knexfile.js
└── [frontend build files] (upload contents of frontend/build folder here)
    ├── index.html
    ├── static/
    └── ...
```

### Option B: Using Git (if you have a repository)

On the server:
```bash
cd ~/domains/volunteerconnect.io/public_html
git clone https://your-repo-url.git .
```

---

## Step 4: Setup Backend on Server

### 4.1: Navigate to Backend Directory
```bash
cd ~/domains/volunteerconnect.io/public_html/backend
# OR if files are in different location:
cd ~/public_html/backend
```

### 4.2: Install Dependencies
```bash
npm install --production
```

### 4.3: Create .env File
```bash
nano .env
```

**Paste this content (generate JWT_SECRET first):**
```env
PORT=3000
NODE_ENV=production
DB_HOST=mysql
DB_USER=u605696782_volunteer
DB_PASSWORD=Volunteer@@123
DB_NAME=u605696782_volunteer
DB_PORT=3306
JWT_SECRET=GENERATE_THIS_BELOW
JWT_EXPIRE=7d
CORS_ORIGIN=https://volunteerconnect.io
```

**Generate JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```
Copy the output and replace `GENERATE_THIS_BELOW` in the .env file.

Save and exit: `Ctrl+X`, then `Y`, then `Enter`

### 4.4: Run Database Migrations
```bash
npm run migrate
```

### 4.5: Test Database Connection
```bash
node -e "require('dotenv').config(); const db = require('./config/database'); db.getConnection((err, conn) => { if(err) console.error('Error:', err); else { console.log('✅ Connected!'); conn.release(); } });"
```

---

## Step 5: Start Backend Server

### Option A: Using PM2 (Recommended)

**Install PM2:**
```bash
npm install -g pm2
```

**Start Server:**
```bash
cd ~/public_html/backend
pm2 start server.js --name volunteerconnect-api
pm2 save
pm2 startup
```

**Useful PM2 Commands:**
```bash
pm2 list              # View running processes
pm2 logs volunteerconnect-api  # View logs
pm2 restart volunteerconnect-api  # Restart server
pm2 stop volunteerconnect-api    # Stop server
```

### Option B: Using Hostinger Node.js App Manager

1. Go to hPanel → **Node.js**
2. Click **Create Node.js App**
3. Configure:
   - **App name**: `volunteerconnect-api`
   - **Node.js version**: 16.x or 18.x
   - **App root**: `/home/u605696782/public_html/backend` (or your actual path)
   - **App startup file**: `server.js`
   - **App mode**: Production
4. Add environment variables (same as .env file)
5. Click **Create**
6. Start the app

### Option C: Using Screen (Alternative)
```bash
screen -S volunteerconnect
cd ~/public_html/backend
node server.js
# Press Ctrl+A then D to detach
```

---

## Step 6: Setup Frontend

### 6.1: Upload Frontend Build Files

Upload the contents of `frontend/build` folder to your web root:
- `~/public_html/` or
- `~/domains/volunteerconnect.io/public_html/`

**Files to upload:**
- `index.html`
- `static/` folder (and all contents)
- Any other files from the build folder

### 6.2: Create .htaccess File

Create `.htaccess` in your `public_html` directory:

```bash
nano ~/public_html/.htaccess
```

**Paste this:**
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

Save and exit.

---

## Step 7: Configure Domain & SSL

### 7.1: Verify DNS Settings

In Hostinger hPanel → **Domains** → **DNS Zone Editor**:

- **A Record**: `@` → `157.173.214.77`
- **CNAME**: `www` → `volunteerconnect.io`

### 7.2: Setup SSL Certificate

1. Go to hPanel → **SSL**
2. Select your domain: `volunteerconnect.io`
3. Click **Install SSL** or **Let's Encrypt**
4. Wait for certificate installation (usually automatic)

---

## Step 8: Configure Reverse Proxy (If Needed)

If your backend runs on port 3000 and you need to access it via `/api`, you may need to configure a reverse proxy.

**For Hostinger VPS with Nginx:**

Create/edit: `/etc/nginx/sites-available/volunteerconnect.io`

```nginx
server {
    listen 80;
    server_name volunteerconnect.io www.volunteerconnect.io;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name volunteerconnect.io www.volunteerconnect.io;

    ssl_certificate /etc/letsencrypt/live/volunteerconnect.io/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/volunteerconnect.io/privkey.pem;

    # API Routes
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /api-docs {
        proxy_pass http://localhost:3000/api-docs;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Frontend
    root /home/u605696782/public_html;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**Note:** For shared hosting, Hostinger usually handles this automatically. Check with Hostinger support if API routes don't work.

---

## Step 9: Test Deployment

### Test Backend API:
```bash
curl https://volunteerconnect.io/api/health
```

### Test API Documentation:
Open in browser: `https://volunteerconnect.io/api-docs`

### Test Frontend:
Open in browser: `https://volunteerconnect.io`

### Test Database Connection:
```bash
cd ~/public_html/backend
node -e "require('dotenv').config(); require('./config/database').getConnection((err, conn) => { if(err) { console.error('❌ Error:', err.message); } else { console.log('✅ Database connected!'); conn.release(); process.exit(0); } });"
```

---

## Step 10: Update Mobile App Configuration

Update `mobile/src/config/api.js` to use production URL:

```javascript
const API_BASE_URL = 'https://volunteerconnect.io/api';
```

Then rebuild your mobile app.

---

## Troubleshooting

### Backend not starting:
```bash
# Check logs
pm2 logs volunteerconnect-api

# Check if port is in use
netstat -tulpn | grep 3000

# Check Node.js version
node -v  # Should be 16+ or 18+
```

### Database connection errors:
```bash
# Test database connection
mysql -h mysql -u u605696782_volunteer -p u605696782_volunteer
# Enter password: Volunteer@@123

# If connection works, check .env file
cat ~/public_html/backend/.env
```

### Frontend not loading:
- Check if `index.html` is in `public_html`
- Check `.htaccess` file exists
- Check file permissions: `chmod 644 ~/public_html/index.html`
- Check browser console for errors

### API routes not working:
- Verify backend is running: `pm2 list`
- Check CORS settings in `backend/server.js`
- Verify domain is in allowed origins
- Check if reverse proxy is configured (for VPS)

---

## Quick Commands Reference

```bash
# View backend logs
pm2 logs volunteerconnect-api

# Restart backend
pm2 restart volunteerconnect-api

# Check backend status
pm2 status

# View server resources
pm2 monit

# Test API
curl https://volunteerconnect.io/api/health

# Check database
mysql -h mysql -u u605696782_volunteer -p u605696782_volunteer
```

---

## Security Notes

⚠️ **Important:**
- Never commit `.env` file to git
- Change JWT_SECRET to a strong random value
- Keep database credentials secure
- Regularly update dependencies: `npm audit fix`
- Monitor server logs for suspicious activity

---

## Support

If you encounter issues:
1. Check PM2 logs: `pm2 logs volunteerconnect-api`
2. Verify environment variables
3. Test database connection
4. Check Hostinger server logs
5. Contact Hostinger support if server issues persist

---

**Deployment Status Checklist:**
- [ ] Files uploaded to server
- [ ] Backend dependencies installed
- [ ] .env file created with correct credentials
- [ ] Database migrations run successfully
- [ ] Backend server running (PM2 or Node.js App Manager)
- [ ] Frontend build files uploaded
- [ ] .htaccess file created
- [ ] SSL certificate installed
- [ ] Domain DNS configured
- [ ] API accessible at `/api/health`
- [ ] API docs accessible at `/api-docs`
- [ ] Frontend accessible at root domain
- [ ] Mobile app configured with production URL

---

**Last Updated**: 2024
**Server**: Hostinger (157.173.214.77)

