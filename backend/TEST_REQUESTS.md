# Test Request Bodies

## Registration Request

### Simple Test Request
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "123-456-7890",
  "password": "password123",
  "confirmPassword": "password123"
}
```

### Copy-Paste Ready (Single Line)
```json
{"name": "John Doe", "email": "john@example.com", "phone": "123-456-7890", "password": "password123", "confirmPassword": "password123"}
```

### Multiple Test Users

**User 1:**
```json
{"name": "John Doe", "email": "john@example.com", "phone": "123-456-7890", "password": "password123", "confirmPassword": "password123"}
```

**User 2:**
```json
{"name": "Jane Smith", "email": "jane@example.com", "phone": "987-654-3210", "password": "password123", "confirmPassword": "password123"}
```

**User 3:**
```json
{"name": "Bob Johnson", "email": "bob@example.com", "phone": "555-123-4567", "password": "password123", "confirmPassword": "password123"}
```

## Testing Instructions

### Using API Documentation Page
1. Go to: http://localhost:3000/apis-docs
2. Find the "POST /api/auth/register" endpoint
3. Copy one of the JSON examples above
4. Paste into the "Request Body (JSON)" textarea
5. Click "Test Endpoint"

### Using cURL
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com", "phone": "123-456-7890", "password": "password123", "confirmPassword": "password123"}'
```

### Using Postman
1. Method: POST
2. URL: http://localhost:3000/api/auth/register
3. Headers: `Content-Type: application/json`
4. Body (raw JSON): Copy one of the examples above

### Using JavaScript Fetch
```javascript
fetch('http://localhost:3000/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: "John Doe",
    email: "john@example.com",
    phone: "123-456-7890",
    password: "password123",
    confirmPassword: "password123"
  })
})
.then(response => response.json())
.then(data => console.log(data));
```

## Registration Success Response
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "123-456-7890",
    "user_type": "volunteer",
    "created_at": "2024-01-01T12:00:00.000Z"
  }
}
```

## Login Request

### Simple Test Request
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Copy-Paste Ready (Single Line)
```json
{"email": "john@example.com", "password": "password123"}
```

## Login Success Response
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "123-456-7890",
    "user_type": "volunteer"
  }
}
```

## Common Errors

### Missing Fields (Registration)
```json
{
  "success": false,
  "message": "Please provide all required fields: name, email, phone, password, confirmPassword"
}
```

### Passwords Don't Match
```json
{
  "success": false,
  "message": "Passwords do not match"
}
```

### Email Already Exists
```json
{
  "success": false,
  "message": "User with this email already exists"
}
```

### Invalid Email Format
```json
{
  "success": false,
  "message": "Invalid email format"
}
```

### Password Too Short
```json
{
  "success": false,
  "message": "Password must be at least 6 characters long"
}
```

### Login Errors

### Invalid Credentials
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

### Missing Login Fields
```json
{
  "success": false,
  "message": "Please provide email and password"
}
```

