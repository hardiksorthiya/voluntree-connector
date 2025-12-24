# Quick Fix: Routes Not Found

## Problem
Getting "Route not found" or "Permissions API endpoint not found" errors.

## Solution

### Step 1: Restart Backend Server
The most common cause is that the server needs to be restarted to load new routes.

```bash
# Stop the server (Ctrl+C)
# Then restart:
cd backend
node server.js
# or
npm start
```

### Step 2: Verify Routes Are Registered
When the server starts, you should see these messages:
```
✅ Auth routes registered
✅ Users routes registered
✅ Permissions routes registered
✅ Roles routes registered
```

If you see any ❌ errors, check the error message.

### Step 3: Test the Routes
1. Open browser and go to: `http://localhost:3000/api/permissions/test`
   - Should return: `{"success":true,"message":"Permissions route is working!"}`

2. If that works, the route is registered correctly.

### Step 4: Check Frontend API URL
Make sure your frontend is pointing to the correct backend URL:
- Check `frontend/src/config/api.js`
- Should be: `http://localhost:3000/api` (or your backend URL)

### Step 5: Verify Database Tables
Run this to check tables exist:
```bash
node backend/scripts/check_all_tables.js
```

## Common Issues

1. **Server not restarted** - Most common issue
2. **Port mismatch** - Frontend calling wrong port
3. **CORS issues** - Check CORS_ORIGIN in .env
4. **Database tables missing** - Run migrations

## Still Not Working?

Check the server console for:
- Route registration messages
- 404 errors with path information
- Database connection errors
- Any other error messages

