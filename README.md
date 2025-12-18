# Volunteer Connect

A comprehensive platform connecting volunteers with organizations. This project includes a web application (React.js), mobile applications (React Native for Android & iOS), and a Node.js backend API with MySQL database.

## Project Structure

```
volunteer-connect/
├── backend/          # Node.js API Server
├── frontend/         # React.js Web Application
├── mobile/           # React Native Mobile App (Android & iOS)
└── database/         # MySQL Database Schema and Scripts
```

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- XAMPP (for MySQL database)
- React Native CLI (for mobile app development)
- Android Studio (for Android development)
- Xcode (for iOS development - macOS only)

## Database Setup

### Option 1: Using Knex Migrations (Recommended)

1. Start XAMPP and ensure MySQL is running
2. Create the database (if it doesn't exist):
   ```sql
   CREATE DATABASE IF NOT EXISTS voluntree;
   ```
   Or via command line:
   ```bash
   mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS voluntree;"
   ```

3. Navigate to backend directory:
   ```bash
   cd backend
   ```

4. Install dependencies (if not already installed):
   ```bash
   npm install
   ```

5. Run migrations:
   ```bash
   npm run migrate
   ```
   This will create all tables automatically.

### Option 2: Using SQL Files (Alternative)

1. Start XAMPP and ensure MySQL is running
2. Open phpMyAdmin (http://localhost/phpmyadmin)
3. Import the database schema:
   ```sql
   -- Run the SQL file: database/schema.sql
   ```
   Or execute it via command line:
   ```bash
   mysql -u root -p < database/schema.sql
   ```

For more details on migrations, see `backend/MIGRATION_GUIDE.md`

## Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your database credentials:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=voluntree
   DB_PORT=3306
   ```

5. Start the server:
   ```bash
   npm start
   # or for development with auto-reload:
   npm run dev
   ```

The API will be available at `http://localhost:3000`

**API Documentation & Testing:**
- Visit `http://localhost:3000/apis-docs` to access the interactive API documentation page
- Test all endpoints directly from the browser
- Check server and database status
- View real-time API responses

## Frontend Setup (Web App)

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your API URL:
   ```
   REACT_APP_API_URL=http://localhost:3000/api
   ```

5. Start the development server:
   ```bash
   npm start
   ```

The web app will be available at `http://localhost:3001`

## Mobile App Setup

### Android Setup

1. Navigate to the mobile directory:
   ```bash
   cd mobile
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. For Android, update the API URL in `mobile/src/config/api.js`:
   ```javascript
   const API_BASE_URL = 'http://10.0.2.2:3000/api'; // Android emulator
   // or
   const API_BASE_URL = 'http://YOUR_LOCAL_IP:3000/api'; // Physical device
   ```

4. Run the Android app:
   ```bash
   npm run android
   ```

### iOS Setup (macOS only)

1. Navigate to the mobile directory:
   ```bash
   cd mobile
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Install iOS dependencies:
   ```bash
   cd ios
   pod install
   cd ..
   ```

4. Update the API URL in `mobile/src/config/api.js`:
   ```javascript
   const API_BASE_URL = 'http://localhost:3000/api'; // iOS simulator
   ```

5. Run the iOS app:
   ```bash
   npm run ios
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID

### Volunteers
- `GET /api/volunteers` - Get all volunteers
- `POST /api/volunteers` - Create a new volunteer

### Organizations
- `GET /api/organizations` - Get all organizations
- `POST /api/organizations` - Create a new organization

## Database Schema

The database includes the following main tables:
- `users` - User accounts (volunteers, organizations, admins)
- `organizations` - Organization details
- `volunteer_profiles` - Volunteer profile information
- `events` - Volunteer events/projects
- `volunteer_registrations` - Volunteer event registrations
- `reviews` - Reviews and ratings
- `notifications` - User notifications

## Development Notes

- Backend API endpoints are currently placeholders and need to be implemented
- Frontend and mobile app authentication flows need to be connected to the backend
- Database connection pooling is configured for optimal performance
- CORS is enabled for cross-origin requests

## Next Steps

1. Implement authentication logic in the backend
2. Connect frontend forms to backend API
3. Implement CRUD operations for all entities
4. Add image upload functionality
5. Implement push notifications for mobile apps
6. Add search and filtering capabilities
7. Implement review and rating system

## License

ISC

