const User = require('../models/User');
const Task = require('../models/Task');

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'member' }).select('-password');

    const taskCounts = await Task.aggregate([
      { $match: { assignedTo: { $ne: null }, assignmentStatus: 'Active' } },
      {
        $group: {
          _id: '$assignedTo',
          count: { $sum: 1 },
          taskTitles: { $push: '$title' },
        },
      },
    ]);

    const taskMap = {};
    taskCounts.forEach((t) => {
      taskMap[t._id.toString()] = { count: t.count, taskTitles: t.taskTitles };
    });

    const enriched = users.map((u) => ({
      ...u.toObject(),
      assignedTaskCount: taskMap[u._id.toString()]?.count || 0,
      assignedTaskTitles: taskMap[u._id.toString()]?.taskTitles || [],
    }));

    res.json({ users: enriched });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { email, password, project, team } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    if (!/^[\w.+-]+@ethara\.ai$/i.test(email)) {
      return res.status(400).json({ message: 'Only @ethara.ai email addresses are allowed' });
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const name = email.split('@')[0];

    const user = await User.create({
      email,
      name,
      password,
      role: 'member',
      project: project || null,
      team: team || null,
    });

    res.status(201).json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        project: user.project,
        team: user.team,
      },
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
