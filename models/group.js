import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    total_members: {
      type: Number,
      default: 0,
      min: 0,
    },
    users: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User'  // Assuming you have a 'User' model to reference
    }],
  },
  { timestamps: true }
);

export default mongoose.model('Group', groupSchema);
