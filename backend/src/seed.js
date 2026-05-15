const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Task = require('./models/Task');
require('dotenv').config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await User.deleteMany({});
    await Task.deleteMany({});

    const admin = await User.create({
      email: 'admin@ethara.ai',
      name: 'admin',
      password: 'password123',
      role: 'admin',
    });

    const member = await User.create({
      email: 'member@ethara.ai',
      name: 'member',
      password: 'password123',
      role: 'member',
      project: 'TECHNICAL',
      team: 'Fenrir',
    });

    console.log('Users created:', {
      admin: admin.email,
      member: member.email,
    });

    await Task.create([
      {
        title: 'Find gigs',
        description: '',
        projectType: 'TECHNICAL',
        team: 'Fenrir',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        priority: 'Medium',
        status: 'To Do',
        createdBy: admin._id,
      },
      {
        title: 'Rate 40 prompts',
        description: '',
        projectType: 'STEM',
        team: 'Valor',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        priority: 'Medium',
        status: 'To Do',
        createdBy: admin._id,
      },
      {
        title: 'Rate 40 LLM responses',
        description: '',
        projectType: 'STEM',
        team: 'Vindex',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        priority: 'Medium',
        status: 'To Do',
        createdBy: admin._id,
      },
    ]);

    console.log('Seed tasks created');
    console.log('\nCredentials:');
    console.log('  Admin: admin@ethara.ai / password123');
    console.log('  Member: member@ethara.ai / password123');

    await mongoose.disconnect();
    console.log('Done');
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
