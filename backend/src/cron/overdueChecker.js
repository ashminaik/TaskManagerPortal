const cron = require('node-cron');
const Task = require('../models/Task');

const checkOverdueTasks = async () => {
  try {
    const now = new Date();
    const result = await Task.updateMany(
      {
        dueDate: { $lt: now },
        status: { $nin: ['Done', 'Overdue'] },
      },
      { $set: { status: 'Overdue' } }
    );
    if (result.modifiedCount > 0) {
      console.log(`[CRON] Marked ${result.modifiedCount} tasks as overdue`);
    }
  } catch (error) {
    console.error('[CRON] Error checking overdue tasks:', error.message);
  }
};

const startOverdueCron = () => {
  cron.schedule('0 * * * *', checkOverdueTasks);
  console.log('[CRON] Overdue task checker scheduled (every hour)');
};

module.exports = startOverdueCron;
