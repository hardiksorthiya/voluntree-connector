const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, confirmPassword } = req.body;
    
    // Validation
    if (!name || !email || !phone || !password || !confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all required fields: name, email, phone, password, confirmPassword' 
      });
    }
    
    if (password !== confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Passwords do not match' 
      });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters long' 
      });
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid email format' 
      });
    }
    
    // Check if user already exists
    const [existingUsers] = await db.promise.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'User with this email already exists' 
      });
    }
    
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Insert user into database
    let insertId;
    try {
      const [result] = await db.promise.execute(
        'INSERT INTO users (name, email, phone, password, user_type) VALUES (?, ?, ?, ?, ?)',
        [name, email, phone, hashedPassword, 'volunteer']
      );
      
      insertId = result.insertId;
    } catch (insertError) {
      console.error('INSERT ERROR:', insertError);
      throw insertError;
    }
    
    // Get the created user (without password)
    const [newUserRows] = await db.promise.execute(
      'SELECT id, name, email, phone, user_type, created_at FROM users WHERE id = ?',
      [insertId]
    );
    
    const newUser = newUserRows;
    
    if (!newUser || newUser.length === 0) {
      throw new Error('User was inserted but could not be retrieved');
    }
    
    res.status(201).json({ 
      success: true,
      message: 'User registered successfully',
      data: newUser[0]
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide email and password' 
      });
    }
    
    // Find user by email
    const [users] = await db.promise.execute(
      'SELECT id, name, email, phone, password, user_type, is_active FROM users WHERE email = ?',
      [email]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }
    
    const user = users[0];
    
    // Check if user is active
    if (!user.is_active) {
      return res.status(401).json({ 
        success: false, 
        message: 'Account is deactivated' 
      });
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        user_type: user.user_type 
      },
      process.env.JWT_SECRET || 'your_jwt_secret_key_here_change_in_production',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
    
    // Remove password from response
    delete user.password;
    
    res.json({ 
      success: true,
      message: 'Login successful',
      token,
      data: user
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Request password reset
// @access  Public
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    // Validation
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide your email address' 
      });
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid email format' 
      });
    }
    
    // Check if user exists
    const [users] = await db.promise.execute(
      'SELECT id, email FROM users WHERE email = ?',
      [email]
    );
    
    // Always return success message for security (don't reveal if email exists)
    if (users.length > 0) {
      // TODO: Generate reset token and send email
      // For now, just return success message
      res.json({ 
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent.'
      });
    } else {
      // Still return success to prevent email enumeration
      res.json({ 
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent.'
      });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

module.exports = router;
