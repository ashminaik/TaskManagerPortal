const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const Task = require('../models/Task');
const { auth } = require('../middleware/auth');

router.get('/:filename', auth, async (req, res) => {
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

    res.sendFile(filePath);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
