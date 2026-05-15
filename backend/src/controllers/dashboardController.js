const Task = require('../models/Task');
const User = require('../models/User');
const mongoose = require('mongoose');

exports.tasksByTeam = async (req, res) => {
  try {
    await Task.updateMany(
      { dueDate: { $lt: new Date() }, status: { $nin: ['Done', 'Overdue'] } },
      { $set: { status: 'Overdue' } }
    );
    const result = await Task.aggregate([
      {
        $group: {
          _id: { project: '$projectType', team: '$team' },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          project: '$_id.project',
          team: '$_id.team',
          count: 1,
        },
      },
    ]);
    res.json({ data: result });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.tasksByStatus = async (req, res) => {
  try {
    await Task.updateMany(
      { dueDate: { $lt: new Date() }, status: { $nin: ['Done', 'Overdue'] } },
      { $set: { status: 'Overdue' } }
    );
    const result = await Task.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);
    const byStatus = { 'To Do': 0, 'In Progress': 0, Done: 0, Overdue: 0 };
    result.forEach((r) => {
      byStatus[r._id] = r.count;
    });
    res.json({ data: byStatus });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.tasksPerUser = async (req, res) => {
  try {
    await Task.updateMany(
      { dueDate: { $lt: new Date() }, status: { $nin: ['Done', 'Overdue'] } },
      { $set: { status: 'Overdue' } }
    );
    const members = await User.find({ role: 'member' }).select('email name project team');

    const taskAgg = await Task.aggregate([
      { $match: { assignedTo: { $ne: null } } },
      {
        $group: {
          _id: '$assignedTo',
          count: { $sum: 1 },
          tasks: { $push: '$title' },
        },
      },
    ]);

    const taskMap = {};
    taskAgg.forEach((t) => {
      taskMap[t._id.toString()] = { count: t.count, taskTitles: t.tasks };
    });

    const data = members.map((m) => ({
      userId: m._id,
      email: m.email,
      name: m.name || m.email.split('@')[0],
      count: taskMap[m._id.toString()]?.count || 0,
      project: m.project,
      team: m.team,
      taskTitles: taskMap[m._id.toString()]?.taskTitles || [],
    }));

    res.json({ data });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.overdueByTeam = async (req, res) => {
  try {
    await Task.updateMany(
      { dueDate: { $lt: new Date() }, status: { $nin: ['Done', 'Overdue'] } },
      { $set: { status: 'Overdue' } }
    );
    const result = await Task.aggregate([
      { $match: { status: 'Overdue' } },
      {
        $group: {
          _id: '$team',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          team: '$_id',
          overdueCount: '$count',
        },
      },
    ]);
    res.json({ data: result });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
