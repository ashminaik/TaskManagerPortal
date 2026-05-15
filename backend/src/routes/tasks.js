const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { auth, adminOnly, memberOnly } = require('../middleware/auth');
const upload = require('../config/upload');

router.use(auth);

router.get('/', taskController.getTasks);
router.post('/', adminOnly, upload.array('files', 10), taskController.createTask);
router.get('/:id', taskController.getTask);
router.patch('/:id/status', memberOnly, taskController.updateStatus);
router.patch('/:id', adminOnly, taskController.updateTask);
router.patch('/:id/assign', adminOnly, taskController.assignTask);
router.patch('/:id/cancel', adminOnly, taskController.cancelAssignment);
router.delete('/:id', adminOnly, taskController.deleteTask);

module.exports = router;
