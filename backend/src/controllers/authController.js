const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user);

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name || user.email.split('@')[0],
        role: user.role,
        project: user.project,
        team: user.team,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.me = async (req, res) => {
  res.json({
    user: {
      ...req.user.toObject(),
      name: req.user.name || req.user.email.split('@')[0],
    },
  });
};

exports.register = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    if (!/^[\w.+-]+@ethara\.ai$/i.test(email)) {
      return res.status(400).json({ message: 'Only @ethara.ai email addresses are allowed' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    const allowedRole = role === 'admin' ? 'admin' : 'member';
    const name = email.split('@')[0];

    const user = await User.create({
      email,
      password,
      name,
      role: allowedRole,
      project: allowedRole === 'member' ? (req.body.project || null) : null,
      team: allowedRole === 'member' ? (req.body.team || null) : null,
    });

    const token = generateToken(user);

    res.status(201).json({
      token,
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
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, project, team } = req.body;

    if (name !== undefined) req.user.name = name;
    if (project !== undefined) req.user.project = project;
    if (team !== undefined) req.user.team = team;

    await req.user.save();

    res.json({
      user: {
        ...req.user.toObject(),
        name: req.user.name || req.user.email.split('@')[0],
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
