import mongoose from "mongoose";

const attendanceSessionSchema = new mongoose.Schema({
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',              
        required: true,
    },
    supervisor: {    
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',              
        required: true,
    },
    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',              
        required: true,
    },
    latitude: {
        type: Number,
        required: true,
    },
    longitude: {
        type: Number,
        required: true,
    },
    radius: {
        type: Number,
        required: true,
    },
    building_name: {
        type: String,
        required: true,
        trim: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    start_time: {
        type: Date,
        required: true,
    },
    end_time: {
        type: Date,
        required: true,
    },
}, { timestamps: true });

export default mongoose.model('AttendanceSession', attendanceSessionSchema);