import mongoose from "mongoose";


// Define the Checkin schema
const checkinSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true,
        index: true, // Optional: if you want to optimize queries filtering by user_id
    },
    attendance_session: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AttendanceSession', 
        required: true,
        index: true, // Optional: if you want to optimize queries filtering by attendance_session_id
    },
    checked_in_at: {
        type: Date,
        default: null, // The timestamp when the user checks in
    },
    checked_out_at: {
        type: Date,
        default: null, // The timestamp when the user checks out
    },
    spoofed: {
        type: Boolean,
        default: false, // Flag for GPS spoof detection
    },
    risk_score: {
        type: Number,
        default: null, // For fraud detection insights (you can set this as a float or number)
    },
    device_id: {
        type: String,
        default: null, // Device identifier (e.g., mobile device ID)
    },
}, {
    timestamps: true, // This will automatically add `createdAt` and `updatedAt` fields
});

export default mongoose.model('Checkin', checkinSchema);