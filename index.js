import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import organizationRoutes from './routes/organization.js';
import authRoutes from './routes/auth.js';
import groupRoutes from './routes/groups.js';
import checkinRoutes from './routes/sessions.js';
import cors from 'cors';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Use organization routes
app.use('/api/v1/organization', organizationRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/organization/groups', groupRoutes);
app.use('/api/v1/organization/sessions', checkinRoutes);


// Set the port from environment variables or default to 3000
app.get('/', (req, res) => {
  res.send('Welcome to the Inbound API');
});
const PORT = process.env.PORT || 3000;


mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log('Connected Successfully');
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.log(err);
})

