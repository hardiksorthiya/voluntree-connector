# Volunteer Connect Setup Guide

## Quick Start

### 1. Database Setup (XAMPP MySQL)

1. Start XAMPP and ensure MySQL service is running
2. Open phpMyAdmin: http://localhost/phpmyadmin
3. Create database manually or import the schema:
   - Click "New" in phpMyAdmin
   - Database name: `voluntree`
   - Collation: `utf8mb4_unicode_ci`
   - Click "Create"
4. Import the schema file:
   - Select `voluntree` database
   - Click "Import" tab
   - Choose file: `database/schema.sql`
   - Click "Go"

Or via command line:
```bash
mysql -u root -p < database/schema.sql
```

### 2. Backend Setup

1. Navigate to backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in `backend/` directory with:
```
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=voluntree
DB_PORT=3306

JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRE=7d

CORS_ORIGIN=http://localhost:3001
```

4. Start backend server:
```bash
npm start
# or for development:
npm run dev
```

Backend will run on: http://localhost:3000

### 3. Frontend Setup (React.js)

1. Navigate to frontend folder:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in `frontend/` directory with:
```
REACT_APP_API_URL=http://localhost:3000/api
```

4. Start frontend:
```bash
npm start
```

Frontend will run on: http://localhost:3001

### 4. Mobile App Setup (React Native)

#### Prerequisites:
- Node.js (v16+)
- React Native CLI: `npm install -g react-native-cli`
- Android Studio (for Android)
- Xcode (for iOS - macOS only)

#### Setup Steps:

1. Navigate to mobile folder:
```bash
cd mobile
```

2. Install dependencies:
```bash
npm install
```

3. For Android:
   - Update API URL in `mobile/src/config/api.js`:
     ```javascript
     const API_BASE_URL = 'http://10.0.2.2:3000/api'; // For Android emulator
     // OR for physical device, use your computer's IP:
     // const API_BASE_URL = 'http://192.168.1.XXX:3000/api';
     ```
   - Run: `npm run android`

4. For iOS (macOS only):
   - Install pods:
     ```bash
     cd ios
     pod install
     cd ..
     ```
   - Update API URL in `mobile/src/config/api.js`:
     ```javascript
     const API_BASE_URL = 'http://localhost:3000/api'; // For iOS simulator
     ```
   - Run: `npm run ios`

## Project Structure

```
voluntree/
├── backend/              # Node.js API
│   ├── config/          # Database & app config
│   ├── routes/          # API routes
│   └── server.js        # Main server file
├── frontend/            # React.js Web App
│   ├── public/          # Static files
│   └── src/             # Source code
│       ├── components/  # React components
│       └── config/      # API configuration
├── mobile/              # React Native App
│   ├── android/         # Android specific
│   ├── ios/             # iOS specific
│   └── src/             # Source code
│       ├── screens/     # App screens
│       └── config/      # API configuration
└── database/            # Database scripts
    ├── schema.sql       # Database schema
    └── seed.sql         # Sample data
```

## Database Tables

- `users` - User accounts
- `organizations` - Organization details
- `volunteer_profiles` - Volunteer information
- `events` - Volunteer events/projects
- `volunteer_registrations` - Event registrations
- `reviews` - Reviews and ratings
- `notifications` - User notifications

## Troubleshooting

### Database Connection Issues
- Ensure MySQL is running in XAMPP
- Check database credentials in backend/.env
- Verify database `voluntree` exists

### Port Already in Use
- Change PORT in backend/.env
- Or kill the process using the port

### Mobile App API Connection
- Android Emulator: Use `10.0.2.2` instead of `localhost`
- iOS Simulator: Use `localhost`
- Physical Device: Use your computer's local IP address

### React Native Setup Issues
- Run `npm install` in mobile directory
- For iOS: Run `pod install` in mobile/ios
- Clear cache: `npm start -- --reset-cache`

## Next Steps

1. Implement authentication endpoints
2. Connect forms to backend API
3. Add image upload functionality
4. Implement push notifications
5. Add search and filters
6. Complete CRUD operations

