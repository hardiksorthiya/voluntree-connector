const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticate, authorize, checkPermission } = require('../middleware/auth');

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
// @desc    Get all users (Permission based)
// @access  Private (Requires user_management permission)
router.get('/', authenticate, checkPermission('user_management'), async (req, res) => {
  try {
    const [users] = await db.promise.execute(
      'SELECT id, name, email, phone, user_type, COALESCE(role, CASE WHEN user_type="admin" THEN 0 WHEN user_type="volunteer" THEN 1 ELSE 1 END) AS role, is_active, created_at FROM users ORDER BY created_at DESC'
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
      'SELECT id, name, email, phone, user_type, COALESCE(role, CASE WHEN user_type="admin" THEN 0 WHEN user_type="volunteer" THEN 1 ELSE 1 END) AS role, is_active, created_at FROM users WHERE id = ?',
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
      'SELECT id, name, email, phone, user_type, COALESCE(role, CASE WHEN user_type="admin" THEN 0 WHEN user_type="volunteer" THEN 1 ELSE 1 END) AS role, is_active, created_at FROM users WHERE id = ?',
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

// @route   PUT /api/users/:id/role
// @desc    Update user role (Admin only)
// @access  Private (Admin)
router.put('/:id/role', authenticate, authorize('admin'), async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { role } = req.body;
    
    // Validate role (0 = admin, 1 = volunteer)
    if (role === undefined || (role !== 0 && role !== 1)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Role must be 0 (admin) or 1 (volunteer)'
      });
    }
    
    // Prevent admin from removing their own admin role
    if (req.user.id === userId && role !== 0) {
      return res.status(400).json({
        success: false,
        message: 'You cannot remove your own admin role'
      });
    }
    
    // Update user role
    await db.promise.execute(
      'UPDATE users SET role = ? WHERE id = ?',
      [role, userId]
    );
    
    // Get updated user
    const [users] = await db.promise.execute(
      'SELECT id, name, email, phone, user_type, COALESCE(role, CASE WHEN user_type="admin" THEN 0 WHEN user_type="volunteer" THEN 1 ELSE 1 END) AS role, is_active, created_at FROM users WHERE id = ?',
      [userId]
    );
    
    res.json({
      success: true,
      message: 'User role updated successfully',
      data: users[0]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

