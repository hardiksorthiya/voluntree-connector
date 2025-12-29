# Volunteer Connect - Production Deployment Guide

## Overview
This document provides step-by-step instructions for deploying the Volunteer Connect platform to production on Hostinger.

**Deployment Structure:**
- **Web Frontend**: `https://volunteerconnect.io`
- **Backend API**: `https://volunteerconnect.io/api` (API docs at `https://volunteerconnect.io/api-docs`)
- **Mobile App**: Configured to use production API

---

## Prerequisites

1. **Hostinger Account** with:
   - VPS or Shared Hosting with Node.js support
   - MySQL database access
   - SSH access (for VPS)
   - Domain: `volunteerconnect.io` configured

2. **Local Development Machine** with:
   - Git installed
   - Node.js (v16 or higher)
   - npm or yarn

3. **Required Information from Hostinger:**
   - Database host, username, password, and database name
   - SSH credentials (if VPS)
   - FTP credentials (if shared hosting)
   - Server IP address

---

## Part 1: Database Setup

### Step 1.1: Create Database on Hostinger

1. Log in to your Hostinger control panel (hPanel)
2. Navigate to **Databases** → **MySQL Databases**
3. Create a new database:
   - Database name: `volunteerconnect` (or your preferred name)
   - Note the database credentials (host, username, password)

### Step 1.2: Import Database Schema

**Option A: Using phpMyAdmin (Recommended for Shared Hosting)**
1. Go to **Databases** → **phpMyAdmin**
2. Select your database
3. Click **Import** tab
4. Upload `database/schema.sql` file
5. Click **Go** to execute

**Option B: Using SSH (For VPS)**
```bash
# Connect to your server via SSH
ssh username@your-server-ip

# Navigate to your project directory
cd /path/to/your/project

# Import schema
mysql -u your_db_user -p your_db_name < database/schema.sql
```

### Step 1.3: Run Database Migrations

```bash
# Navigate to backend directory
cd backend

# Set environment variables (see Part 2)
# Then run migrations
npm run migrate
```

---

## Part 2: Backend API Deployment

### Step 2.1: Upload Backend Files

**Option A: Using Git (Recommended for VPS)**
```bash
# On your local machine, ensure all changes are committed
git add .
git commit -m "Production deployment"
git push origin main

# On Hostinger server via SSH
ssh username@your-server-ip
cd /path/to/your/project
git pull origin main
```

**Option B: Using FTP/SFTP**
1. Use FileZilla or similar FTP client
2. Connect to your Hostinger server
3. Upload the entire `backend` folder to your server
4. Recommended path: `/home/username/volunteerconnect/backend`

### Step 2.2: Install Node.js Dependencies

```bash
# SSH into your server
ssh username@your-server-ip

# Navigate to backend directory
cd /path/to/backend

# Install dependencies
npm install --production
```

### Step 2.3: Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cd /path/to/backend
nano .env
```

**Production `.env` Configuration:**
```env
# Server Configuration
PORT=3000
NODE_ENV=production

# Database Configuration (Get from Hostinger hPanel)
DB_HOST=localhost
DB_USER=your_database_username
DB_PASSWORD=your_database_password
DB_NAME=volunteerconnect
DB_PORT=3306

# JWT Secret (Generate a strong random string)
JWT_SECRET=your_very_strong_jwt_secret_key_minimum_32_characters_long
JWT_EXPIRE=7d

# CORS Configuration
CORS_ORIGIN=https://volunteerconnect.io
```

**Generate JWT Secret:**
```bash
# On Linux/Mac
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Step 2.4: Update CORS Settings

Edit `backend/server.js` to allow your production domain:

```javascript
const allowedOrigins = [
  'https://volunteerconnect.io',
  'https://www.volunteerconnect.io',
  // Add any other allowed origins
];
```

### Step 2.5: Run Database Migrations

```bash
cd /path/to/backend
npm run migrate
```

### Step 2.6: Start Backend Server

**Option A: Using PM2 (Recommended for VPS)**

```bash
# Install PM2 globally
npm install -g pm2

# Start the server
cd /path/to/backend
pm2 start server.js --name volunteerconnect-api

# Save PM2 configuration
pm2 save

# Setup PM2 to start on server reboot
pm2 startup
# Follow the instructions provided by PM2
```

**Option B: Using Node.js directly (Not recommended for production)**
```bash
cd /path/to/backend
node server.js
```

**Option C: Using Hostinger Node.js App Manager (Shared Hosting)**
1. Go to hPanel → **Node.js**
2. Create a new Node.js app
3. Set:
   - **App name**: `volunteerconnect-api`
   - **Node.js version**: 16.x or higher
   - **App root**: `/path/to/backend`
   - **App startup file**: `server.js`
   - **App mode**: Production
4. Add environment variables in the Node.js app settings
5. Start the application

### Step 2.7: Configure Reverse Proxy (Nginx)

If you have VPS access, configure Nginx to proxy requests:

```nginx
# /etc/nginx/sites-available/volunteerconnect.io
server {
    listen 80;
    server_name volunteerconnect.io www.volunteerconnect.io;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name volunteerconnect.io www.volunteerconnect.io;

    # SSL Certificate (Let's Encrypt)
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

    # API Documentation
    location /api-docs {
        proxy_pass http://localhost:3000/api-docs;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Frontend (will be configured in Part 3)
    location / {
        root /path/to/frontend/build;
        try_files $uri $uri/ /index.html;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/volunteerconnect.io /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Step 2.8: Setup SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d volunteerconnect.io -d www.volunteerconnect.io

# Auto-renewal (already configured by Certbot)
sudo certbot renew --dry-run
```

---

## Part 3: Frontend Web Deployment

### Step 3.1: Update API Configuration

Edit `frontend/src/config/api.js`:

```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://volunteerconnect.io/api';
```

### Step 3.2: Create Production Environment File

Create `frontend/.env.production`:

```env
REACT_APP_API_URL=https://volunteerconnect.io/api
```

### Step 3.3: Build Frontend for Production

**On your local machine:**
```bash
cd frontend
npm install
npm run build
```

This creates an optimized production build in the `frontend/build` directory.

### Step 3.4: Upload Frontend Build

**Option A: Using FTP/SFTP**
1. Upload the entire contents of `frontend/build` folder
2. Upload to: `/home/username/public_html` or your web root directory

**Option B: Using Git + Build on Server**
```bash
# On server via SSH
cd /path/to/frontend
npm install
npm run build
```

### Step 3.5: Configure Web Server

**For Shared Hosting:**
- Upload `build` folder contents to `public_html` directory
- Ensure `.htaccess` file exists (see below)

**Create `.htaccess` file in `public_html`:**
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

**For VPS with Nginx:**
The Nginx configuration in Part 2.7 already handles the frontend routing.

---

## Part 4: Mobile App Configuration

### Step 4.1: Update Mobile API Configuration

Edit `mobile/src/config/api.js`:

```javascript
// Production API URL
const API_BASE_URL = 'https://volunteerconnect.io/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});
```

### Step 4.2: Build Mobile App

**For Android:**
```bash
cd mobile
npm install

# Build APK
npx expo build:android

# Or build AAB (for Google Play Store)
npx expo build:android -t app-bundle
```

**For iOS:**
```bash
cd mobile
npm install

# Build iOS app
npx expo build:ios
```

### Step 4.3: Deploy to App Stores

1. **Google Play Store:**
   - Upload the AAB file to Google Play Console
   - Complete store listing and submit for review

2. **Apple App Store:**
   - Upload the IPA file via App Store Connect
   - Complete app information and submit for review

---

## Part 5: Domain Configuration

### Step 5.1: DNS Settings

In your Hostinger DNS settings, configure:

**A Record:**
- **Name**: `@` (or blank)
- **Type**: A
- **Value**: Your server IP address
- **TTL**: 3600

**CNAME Record (for www):**
- **Name**: `www`
- **Type**: CNAME
- **Value**: `volunteerconnect.io`
- **TTL**: 3600

### Step 5.2: Verify Domain

1. Wait for DNS propagation (can take up to 48 hours, usually 1-2 hours)
2. Verify using: `nslookup volunteerconnect.io`
3. Test access: `https://volunteerconnect.io`

---

## Part 6: Security Checklist

### 6.1: Environment Variables
- [ ] All sensitive data in `.env` file
- [ ] `.env` file is in `.gitignore`
- [ ] Strong JWT secret (minimum 32 characters)
- [ ] Database credentials are secure

### 6.2: Server Security
- [ ] Firewall configured (only allow necessary ports)
- [ ] SSH key authentication enabled
- [ ] Regular security updates
- [ ] SSL certificate installed and auto-renewing

### 6.3: Application Security
- [ ] CORS properly configured
- [ ] Input validation on all endpoints
- [ ] Rate limiting implemented
- [ ] Error messages don't expose sensitive information

### 6.4: Database Security
- [ ] Strong database passwords
- [ ] Database user has minimal required permissions
- [ ] Regular database backups configured

---

## Part 7: Monitoring and Maintenance

### 7.1: Setup Logging

**Using PM2:**
```bash
# View logs
pm2 logs volunteerconnect-api

# Monitor in real-time
pm2 monit
```

### 7.2: Setup Backups

**Database Backup Script:**
```bash
#!/bin/bash
# backup-db.sh
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u your_db_user -p your_db_name > /backups/volunteerconnect_$DATE.sql
```

**Schedule with Cron:**
```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /path/to/backup-db.sh
```

### 7.3: Health Checks

Monitor these endpoints:
- API Health: `https://volunteerconnect.io/api/health`
- API Docs: `https://volunteerconnect.io/api-docs`
- Frontend: `https://volunteerconnect.io`

### 7.4: Performance Optimization

1. **Enable Gzip Compression** (Nginx):
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
```

2. **Enable Caching** for static assets
3. **Database Indexing** - Ensure proper indexes on frequently queried columns
4. **CDN** - Consider using a CDN for static assets

---

## Part 8: Troubleshooting

### Common Issues

**1. API not accessible:**
- Check if backend server is running: `pm2 list`
- Check firewall settings
- Verify port 3000 is open
- Check Nginx configuration

**2. Database connection errors:**
- Verify database credentials in `.env`
- Check database host (use `localhost` for same server)
- Ensure database user has proper permissions
- Check if MySQL service is running

**3. CORS errors:**
- Verify CORS origin in `backend/server.js`
- Check if domain matches exactly (including https://)
- Clear browser cache

**4. Frontend not loading:**
- Verify build files are uploaded correctly
- Check `.htaccess` file exists (for Apache)
- Verify Nginx configuration (for VPS)
- Check browser console for errors

**5. SSL certificate issues:**
- Verify DNS is pointing to correct IP
- Check certificate expiration: `sudo certbot certificates`
- Renew if needed: `sudo certbot renew`

---

## Part 9: Post-Deployment Checklist

- [ ] Backend API accessible at `https://volunteerconnect.io/api`
- [ ] API documentation accessible at `https://volunteerconnect.io/api-docs` (also works at `/apis-docs`)
- [ ] Frontend web app accessible at `https://volunteerconnect.io`
- [ ] Database migrations completed successfully
- [ ] SSL certificate installed and working
- [ ] Mobile app configured with production API URL
- [ ] All environment variables set correctly
- [ ] CORS configured for production domain
- [ ] PM2 or process manager configured
- [ ] Database backups configured
- [ ] Monitoring and logging setup
- [ ] Security checklist completed
- [ ] Test user registration and login
- [ ] Test API endpoints from frontend
- [ ] Test mobile app connection

---

## Part 10: Quick Reference

### Important URLs
- **Web App**: `https://volunteerconnect.io`
- **API Base**: `https://volunteerconnect.io/api`
- **API Docs**: `https://volunteerconnect.io/api-docs`
- **Health Check**: `https://volunteerconnect.io/api/health`

### Important Commands

**Backend:**
```bash
# Start server
pm2 start server.js --name volunteerconnect-api

# Stop server
pm2 stop volunteerconnect-api

# Restart server
pm2 restart volunteerconnect-api

# View logs
pm2 logs volunteerconnect-api

# Run migrations
cd backend && npm run migrate
```

**Frontend:**
```bash
# Build for production
cd frontend && npm run build
```

**Database:**
```bash
# Backup
mysqldump -u user -p database_name > backup.sql

# Restore
mysql -u user -p database_name < backup.sql
```

---

## Support

For issues or questions:
1. Check server logs: `pm2 logs`
2. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Check database connection
4. Verify environment variables
5. Review this deployment guide

---

## Notes

- **Hostinger Shared Hosting**: May have limitations on Node.js apps. Consider upgrading to VPS for better control.
- **Port Configuration**: Some shared hosting may require specific ports. Check Hostinger documentation.
- **File Permissions**: Ensure proper file permissions (755 for directories, 644 for files)
- **Memory Limits**: Monitor server memory usage, especially with PM2

---

**Last Updated**: 2024
**Version**: 1.0.0

