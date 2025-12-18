# Database Setup Guide

## Initial Setup

If you're setting up the database for the first time:

1. Start XAMPP MySQL service
2. Open phpMyAdmin (http://localhost/phpmyadmin)
3. Import `schema.sql` file:
   - Click "Import" tab
   - Choose file: `schema.sql`
   - Click "Go"

Or via command line:
```bash
mysql -u root -p < schema.sql
```

## Updating Existing Database

If you already have the database with the old schema (using `first_name` and `last_name`):

1. Import `update_schema.sql` to update the users table:
   ```bash
   mysql -u root -p < update_schema.sql
   ```

Or manually run in phpMyAdmin:
```sql
USE voluntree;

ALTER TABLE users 
ADD COLUMN name VARCHAR(200) AFTER password;

UPDATE users SET name = CONCAT(first_name, " ", last_name) WHERE first_name IS NOT NULL;

ALTER TABLE users MODIFY name VARCHAR(200) NOT NULL;

ALTER TABLE users DROP COLUMN first_name;
ALTER TABLE users DROP COLUMN last_name;
```

## Database Structure

### Users Table
- `id` - Primary key (auto increment)
- `email` - Unique email address
- `password` - Hashed password (bcrypt)
- `name` - Full name
- `phone` - Phone number
- `user_type` - Enum: 'volunteer', 'organization', 'admin'
- `profile_image` - Profile image path
- `is_active` - Boolean (default: true)
- `created_at` - Timestamp
- `updated_at` - Timestamp

## Testing Registration

After setting up the database, you can test registration via:

1. API Documentation: http://localhost:3000/apis-docs
2. Frontend: http://localhost:3001/register
3. Mobile App: Registration screen

The registration will now save data to the `users` table in the database.

