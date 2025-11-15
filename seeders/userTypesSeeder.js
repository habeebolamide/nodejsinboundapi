// seeders/userTypesSeeder.js
import mongoose from 'mongoose';
import UserType from '../models/userType.js';
import 'dotenv/config';

const MONGO_URI = process.env.MONGO_URI;

const seedData = [
  { name: 'owner' },
  { name: 'admin' },
  { name: 'supervisor' },
  { name: 'member' },
];

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    await UserType.deleteMany({});
    const docs = await UserType.create(seedData);
    console.log(`Inserted ${docs.length} user types`);

    console.log('UserTypes seeded');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();