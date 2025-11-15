// seeders/usersSeeder.js
import mongoose from 'mongoose';
import Organization from '../models/organizationModel.js';
import UserType from '../models/userType.js';
import User from '../models/users.js';
import 'dotenv/config';
import bcrypt from 'bcryptjs';

const MONGO_URI = process.env.MONGO_URI ;

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const orgs = await Organization.find().lean();
    const types = await UserType.find().lean();
    if (!orgs.length || !types.length) {
      throw new Error('Run organization & userType seeders first!');
    }

    await User.deleteMany({});

    const hash = (pwd) => bcrypt.hashSync(pwd, 10);

    const users = [
      {
        organization: orgs[0]._id, // Crescent University
        userType: types[0]._id,    // Admin
        user_id: 'ADMIN001',
        name: 'Super Admin',
        email: 'admin@crescent.edu.ng',
        password: hash('password123'),
        email_verified_at: new Date(),
      },
      {
        organization: orgs[0]._id,
        userType: types[1]._id, // Teacher
        user_id: 'TEACH001',
        name: 'Prof. Ahmed',
        email: 'ahmed@crescent.edu.ng',
        password: hash('teacher123'),
      },
      {
        organization: orgs[1]._id, // TechWave Inc.
        userType: types[3]._id, // Employee
        user_id: 'EMP001',
        name: 'Jane Doe',
        email: 'jane@techwave.com',
        password: hash('emp123'),
        email_verified_at: new Date(),
      },
    ];

    const docs = await User.create(users);
    console.log(`Inserted ${docs.length} users`);

    console.log('Users seeded');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();