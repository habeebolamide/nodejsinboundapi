// src/models/organization.js
import mongoose from 'mongoose';

const organizationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    type: { type: String, enum: ['school', 'company'], required: true },
    address: { type: String, default: null },
  },
  { timestamps: true }
);

export default mongoose.model('Organization', organizationSchema);