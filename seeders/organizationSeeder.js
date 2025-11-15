
import mongoose from 'mongoose';
import Organization from '../models/organizationModel.js'; 
import 'dotenv/config'; 

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/myapp';

// Simple slug helper (no external deps)
const slugify = (str) =>
  str
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '');

// ---------- SEED DATA ----------
const seedData = [
  {
    name: 'Crescent University',
    slug: slugify('Crescent University'),
    email: 'info@crescent.edu.ng',
    address: 'Kobape Road, Abeokuta',
    type: 'school',
  },
  {
    name: 'TechWave Inc.',
    slug: slugify('TechWave Inc.'),
    email: 'hello@techwave.com',
    address: '15 Admiralty Way, Lekki Phase 1, Lagos',
    type: 'company',
  },
];

// ---------- MAIN ----------
async function runSeeder() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected');

    // Optional: wipe collection first
    await Organization.deleteMany({});
    console.log('Cleared existing organizations');

    // Insert seed data
    const docs = await Organization.create(seedData);
    console.log(`Inserted ${docs.length} organizations`);

    console.log('Seeder finished successfully');
  } catch (err) {
    console.error('Seeder error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run it
runSeeder();