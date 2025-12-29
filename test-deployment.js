// Test script to verify production configuration
// Run this on the server after deployment: node test-deployment.js

require('dotenv').config();
const mysql = require('mysql2');
const axios = require('axios');

console.log('🧪 Testing Volunteer Connect Deployment\n');
console.log('=====================================\n');

// Test 1: Environment Variables
console.log('1️⃣  Testing Environment Variables...');
const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'JWT_SECRET', 'PORT'];
let envOk = true;

requiredEnvVars.forEach(varName => {
  if (process.env[varName]) {
    console.log(`   ✅ ${varName}: ${varName.includes('PASSWORD') || varName.includes('SECRET') ? '***' : process.env[varName]}`);
  } else {
    console.log(`   ❌ ${varName}: MISSING`);
    envOk = false;
  }
});

if (!envOk) {
  console.log('\n   ⚠️  Some environment variables are missing. Check your .env file.\n');
} else {
  console.log('\n   ✅ All environment variables are set.\n');
}

// Test 2: Database Connection
console.log('2️⃣  Testing Database Connection...');
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306
});

db.connect((err) => {
  if (err) {
    console.log(`   ❌ Database connection failed: ${err.message}\n`);
  } else {
    console.log('   ✅ Database connected successfully!\n');
    
    // Test query
    db.query('SELECT COUNT(*) as count FROM users', (err, results) => {
      if (err) {
        console.log(`   ⚠️  Query test failed: ${err.message}\n`);
      } else {
        console.log(`   ✅ Database query successful (Users table exists)\n`);
      }
      db.end();
      
      // Test 3: Server Status
      console.log('3️⃣  Testing Server Status...');
      const port = process.env.PORT || 3000;
      const baseUrl = process.env.CORS_ORIGIN || `http://localhost:${port}`;
      
      axios.get(`${baseUrl}/api/health`)
        .then(response => {
          console.log(`   ✅ Server is running and responding`);
          console.log(`   📊 Status: ${JSON.stringify(response.data)}\n`);
        })
        .catch(error => {
          console.log(`   ⚠️  Server test: ${error.message}`);
          console.log(`   💡 Make sure the server is running on port ${port}\n`);
        });
    });
  }
});

console.log('\n✅ Deployment test complete!\n');

