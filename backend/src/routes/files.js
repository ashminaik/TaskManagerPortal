const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const Task = require('../models/Task');
const User = require('../models/User');

const softAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    const queryToken = req.query.token;
    const tokenStr = header?.startsWith('Bearer ') ? header.split(' ')[1] : queryToken;

    if (!tokenStr) return res.status(401).json({ message: 'No token provided' });

    const decoded = jwt.verify(tokenStr, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ message: 'User not found' });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

router.get('/:filename', softAuth, async (req, res) => {
  try {
    const filePath = path.join(__dirname, '../../uploads', req.params.filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    const task = await Task.findOne({ 'files.filename': req.params.filename });
    if (!task) {
      return res.status(404).json({ message: 'File not found' });
    }

    if (req.user.role === 'member') {
      if (!task.assignedTo || task.assignedTo.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
      }
    }

    const fileRecord = task.files.find((f) => f.filename === req.params.filename);
    res.setHeader('Content-Disposition', `attachment; filename="${fileRecord?.originalName || req.params.filename}"`);
    res.sendFile(filePath);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
