const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

// @route   GET /api/users/me
// @desc    Get current user profile
// @access  Private
router.get('/me', authenticate, async (req, res) => {
  try {
    res.json({
      success: true,
      data: req.user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/users
// @desc    Get all users (Admin only)
// @access  Private (Admin)
router.get('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const [users] = await db.promise.execute(
      'SELECT id, name, email, phone, user_type, is_active, created_at FROM users ORDER BY created_at DESC'
    );
    
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private
router.get('/:id', authenticate, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    // Users can only view their own profile unless they're admin
    if (req.user.id !== userId && req.user.user_type !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    const [users] = await db.promise.execute(
      'SELECT id, name, email, phone, user_type, is_active, created_at FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: users[0]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/users/me
// @desc    Update current user profile
// @access  Private
router.put('/me', authenticate, async (req, res) => {
  try {
    const { name, phone } = req.body;
    const userId = req.user.id;
    
    // Build update query dynamically
    const updates = [];
    const values = [];
    
    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    
    if (phone !== undefined) {
      updates.push('phone = ?');
      values.push(phone);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }
    
    values.push(userId);
    
    await db.promise.execute(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
    
    // Get updated user
    const [users] = await db.promise.execute(
      'SELECT id, name, email, phone, user_type, is_active, created_at FROM users WHERE id = ?',
      [userId]
    );
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: users[0]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

