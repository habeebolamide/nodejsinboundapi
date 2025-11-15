// models/userType.js
import mongoose from 'mongoose';

const userTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('UserType', userTypeSchema);