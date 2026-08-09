// Phase 3: RBAC Middleware
import userModel from '../models/userModel.js';

const isAdmin = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.user.userId);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    if (user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access denied' });
    }
    next();
  } catch (error) {
    console.error('isAdmin middleware error:', error);
    res.status(500).json({ success: false, message: 'Server error in admin check' });
  }
};

export default isAdmin;
