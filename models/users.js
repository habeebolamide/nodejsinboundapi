// models/user.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    userType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserType',
      required: true,
    },
    user_id: {
      type: String,
      unique: true,
      sparse: true, 
    },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email_verified_at: { type: Date, default: null },
    remember_token: { type: String, default: null },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);