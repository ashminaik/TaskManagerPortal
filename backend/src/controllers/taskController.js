const Task = require('../models/Task');
const User = require('../models/User');

exports.getTasks = async (req, res) => {
  try {
    await Task.updateMany(
      { dueDate: { $lt: new Date() }, status: { $nin: ['Done', 'Overdue'] } },
      { $set: { status: 'Overdue' } }
    );

    const filter = {};

    if (req.user.role === 'member') {
      filter.assignedTo = req.user._id;
      filter.assignmentStatus = 'Active';
    }

    const { priority, team, project, assignedTo, status, search } = req.query;

    if (priority) filter.priority = priority;
    if (team) filter.team = team;
    if (project) filter.projectType = project;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (status) filter.status = status;

    if (search) {
      const users = await User.find({
        $or: [
          { email: { $regex: search, $options: 'i' } },
        ],
      }).select('_id');
      const userIds = users.map((u) => u._id);

      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { team: { $regex: search, $options: 'i' } },
        { projectType: { $regex: search, $options: 'i' } },
      ];
      if (userIds.length > 0) {
        filter.$or.push({ assignedTo: { $in: userIds } });
      }
    }

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'email role project team')
      .populate('createdBy', 'email')
      .sort({ createdAt: -1 });

    res.json({ tasks });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'email role project team')
      .populate('createdBy', 'email');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (req.user.role === 'member') {
      if (!task.assignedTo || task.assignedTo._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
      }
    }

    res.json({ task });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createTask = async (req, res) => {
  try {
    const { title, description, projectType, team, dueDate, dueTime, priority } = req.body;

    const files = (req.files || []).map((file) => ({
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      path: file.path,
    }));

    const task = await Task.create({
      title,
      description,
      projectType,
      team,
      dueDate,
      dueTime: dueTime || '23:59',
      priority: priority || 'Medium',
      createdBy: req.user._id,
      files,
    });

    const populated = await Task.findById(task._id)
      .populate('assignedTo', 'email role project team')
      .populate('createdBy', 'email');

    res.status(201).json({ task: populated });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (req.user.role === 'member') {
      if (!task.assignedTo || task.assignedTo.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
      }
    }

    const { status } = req.body;
    task.status = status;
    await task.save();

    const populated = await Task.findById(task._id)
      .populate('assignedTo', 'email role project team')
      .populate('createdBy', 'email');

    res.json({ task: populated });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const { dueDate, dueTime, projectType, team } = req.body;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (dueTime !== undefined) task.dueTime = dueTime;
    if (projectType !== undefined) task.projectType = projectType;
    if (team !== undefined) task.team = team;
    await task.save();

    const populated = await Task.findById(task._id)
      .populate('assignedTo', 'email role project team')
      .populate('createdBy', 'email');

    res.json({ task: populated });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.assignTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const { userId } = req.body;
    const member = await User.findById(userId);
    if (!member || member.role !== 'member') {
      return res.status(400).json({ message: 'Invalid member' });
    }

    task.assignedTo = userId;
    task.assignmentStatus = 'Active';
    await task.save();

    const populated = await Task.findById(task._id)
      .populate('assignedTo', 'email role project team')
      .populate('createdBy', 'email');

    res.json({ task: populated });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.cancelAssignment = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.assignmentStatus = 'Cancelled';
    await task.save();

    const populated = await Task.findById(task._id)
      .populate('assignedTo', 'email role project team')
      .populate('createdBy', 'email');

    res.json({ task: populated });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
