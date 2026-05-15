const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { auth, adminOnly } = require('../middleware/auth');

router.use(auth);
router.use(adminOnly);

router.get('/tasks-by-team', dashboardController.tasksByTeam);
router.get('/tasks-by-status', dashboardController.tasksByStatus);
router.get('/tasks-per-user', dashboardController.tasksPerUser);
router.get('/overdue-by-team', dashboardController.overdueByTeam);

module.exports = router;
