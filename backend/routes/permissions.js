const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

// Test endpoint to verify route is working (remove in production)
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Permissions route is working!',
    timestamp: new Date().toISOString()
  });
});

// @route   GET /api/permissions
// @desc    Get all permissions (Admin only)
// @access  Private (Admin)
router.get('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const [permissions] = await db.promise.execute(
      'SELECT * FROM role_permissions ORDER BY permission_name ASC'
    );
    
    res.json({
      success: true,
      count: permissions.length,
      data: permissions
    });
  } catch (error) {
    // Handle case where table doesn't exist yet
    if (error.code === 'ER_NO_SUCH_TABLE' || error.message.includes("doesn't exist")) {
      return res.status(500).json({ 
        success: false, 
        message: 'Permissions table not found. Please run database migration: npx knex migrate:latest' 
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/permissions/check/:key
// @desc    Check if current user has access to a permission
// @access  Private
// NOTE: This route must come BEFORE /:key to avoid route conflicts
router.get('/check/:key', authenticate, async (req, res) => {
  try {
    const { key } = req.params;
    
    // Get user role
    let userRole = req.user.role;
    if (typeof userRole === 'bigint') {
      userRole = Number(userRole);
    } else if (typeof userRole === 'string') {
      userRole = parseInt(userRole, 10);
    } else {
      userRole = Number(userRole);
    }
    
    if (isNaN(userRole)) {
      userRole = req.user.user_type === 'admin' ? 0 : 1;
    }
    
    // Get permission
    const [permissions] = await db.promise.execute(
      'SELECT * FROM role_permissions WHERE permission_key = ?',
      [key]
    );
    
    if (permissions.length === 0) {
      return res.json({
        success: true,
        hasAccess: false,
        message: 'Permission not found'
      });
    }
    
    const permission = permissions[0];
    const roleAccessField = `role_${userRole}_access`;
    const hasAccess = permission[roleAccessField] === true || permission[roleAccessField] === 1;
    
    res.json({
      success: true,
      hasAccess: hasAccess,
      permission: permission
    });
  } catch (error) {
    // Handle case where table doesn't exist yet
    if (error.code === 'ER_NO_SUCH_TABLE' || error.message.includes("doesn't exist")) {
      return res.json({
        success: true,
        hasAccess: false,
        message: 'Permissions table not found. Please run database migration.'
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/permissions/:key
// @desc    Get permission by key
// @access  Private (Admin)
router.get('/:key', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { key } = req.params;
    
    // Don't treat "check" as a permission key
    if (key === 'check') {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }
    
    const [permissions] = await db.promise.execute(
      'SELECT * FROM role_permissions WHERE permission_key = ?',
      [key]
    );
    
    if (permissions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Permission not found'
      });
    }
    
    res.json({
      success: true,
      data: permissions[0]
    });
  } catch (error) {
    // Handle case where table doesn't exist yet
    if (error.code === 'ER_NO_SUCH_TABLE' || error.message.includes("doesn't exist")) {
      return res.status(500).json({ 
        success: false, 
        message: 'Permissions table not found. Please run database migration: npx knex migrate:latest' 
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/permissions/:key
// @desc    Update permission access for roles (Admin only)
// @access  Private (Admin)
router.put('/:key', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { key } = req.params;
    const { role_0_access, role_1_access } = req.body;
    
    // Validate that at least one field is provided
    if (role_0_access === undefined && role_1_access === undefined) {
      return res.status(400).json({
        success: false,
        message: 'At least one role access field must be provided'
      });
    }
    
    // Check if permission exists
    const [permissions] = await db.promise.execute(
      'SELECT * FROM role_permissions WHERE permission_key = ?',
      [key]
    );
    
    if (permissions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Permission not found'
      });
    }
    
    // Build update query dynamically
    const updates = [];
    const values = [];
    
    if (role_0_access !== undefined) {
      updates.push('role_0_access = ?');
      values.push(role_0_access);
    }
    
    if (role_1_access !== undefined) {
      updates.push('role_1_access = ?');
      values.push(role_1_access);
    }
    
    values.push(key);
    
    await db.promise.execute(
      `UPDATE role_permissions SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE permission_key = ?`,
      values
    );
    
    // Get updated permission
    const [updatedPermissions] = await db.promise.execute(
      'SELECT * FROM role_permissions WHERE permission_key = ?',
      [key]
    );
    
    res.json({
      success: true,
      message: 'Permission updated successfully',
      data: updatedPermissions[0]
    });
  } catch (error) {
    // Handle case where table doesn't exist yet
    if (error.code === 'ER_NO_SUCH_TABLE' || error.message.includes("doesn't exist")) {
      return res.status(500).json({ 
        success: false, 
        message: 'Permissions table not found. Please run database migration: npx knex migrate:latest' 
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

