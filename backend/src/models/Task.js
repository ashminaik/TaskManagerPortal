const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    projectType: {
      type: String,
      enum: ['STEM', 'NON_STEM', 'TECHNICAL'],
      required: [true, 'Project type is required'],
    },
    team: {
      type: String,
      required: [true, 'Team is required'],
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    dueTime: {
      type: String,
      default: '23:59',
    },
    priority: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['To Do', 'In Progress', 'Done', 'Overdue'],
      default: 'To Do',
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    assignmentStatus: {
      type: String,
      enum: ['Active', 'Cancelled'],
      default: 'Active',
    },
    files: [
      {
        filename: String,
        originalName: String,
        mimetype: String,
        path: String,
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);
