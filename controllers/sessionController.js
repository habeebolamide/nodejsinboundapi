import Group from "../models/group.js";
import User from "../models/users.js";
import AttendanceSession from "../models/attendanceSession.js";
import { sendError, sendResponse } from "../helpers/helper.js";
import GroupUser from "../models/groupUser.js";
import Checkin from "../models/checkin.js";

export const createSession = async (req, res) => {

    try {
        const { group, supervisor, title, latitude, longitude, radius, start_time, end_time, building_name } = req.body;
        const authUser = req.user;

        const groups = await Group.findOne({ _id: group, organization: authUser.organization });
        if (!groups) {
            return res.status(403).json({ message: 'Invalid group for your organization.' });
        }

        const supervisors = await User.findOne({ _id: supervisor, organization: authUser.organization });

        if (!supervisors) {
            return res.status(403).json({ message: 'Invalid supervisor for your organization.' });
        }

        const sessionExists = await AttendanceSession.findOne({
            $or: [
                {
                    group,
                    start_time: { $lt: end_time },
                    end_time: { $gt: start_time },
                    organization: authUser.organization
                },
                {
                    supervisor,
                    start_time: { $lt: end_time },
                    end_time: { $gt: start_time },
                    organization: authUser.organization
                }
            ]
        });

        if (sessionExists) {
            return res.status(400).json({ message: 'A session with the same group or supervisor already exists during that time.' });
        }


        const session = await AttendanceSession.create({
            group,
            start_time,
            supervisor,
            organization: authUser.organization,
            title,
            latitude,
            longitude,
            radius: radius || 50,
            end_time,
            building_name,
            status: 'scheduled'
        });

        res.status(201).json(sendResponse('Session created successfully.', session));
    } catch (error) {
        res.status(500).json(sendError(error.message));
    }

}

export const getAll = async (req, res) => {
    const authUserid = req.user.id;

    try {
        const authUser = await User.findById(authUserid).populate('userType');


        const groupUsers = await GroupUser.find({ user: authUser._id }).populate('group');
        const groupIds = groupUsers.map(groupUser => groupUser.group._id);

        let sessionsQuery = AttendanceSession.find({ organization: authUser.organization })
            // .populate('group')
            // .populate('supervisor')
            .sort({ start_time: -1 });

        if (authUser.userType.name === 'supervisor') {
            sessionsQuery = sessionsQuery.where('supervisor').equals(authUser._id);
        }
        if (authUser.userType.name === 'admin') {
            sessionsQuery = sessionsQuery.populate('group').populate('supervisor');
        }
        else if (authUser.userType.name === 'member') {
            sessionsQuery = sessionsQuery.where('group').in(groupIds);
        }

        const sessions = await sessionsQuery.exec();

        res.status(200).json(sendResponse('Sessions fetched successfully.', sessions));

    } catch (err) {
        // Handle errors
        res.status(500).json(sendError(err.message));
    }
}

export const getTodaySessions = async (req, res) => {
    try {
        const user = req.user;
        if (!user?.organization) return res.status(401).json(sendResponse('Unauthorized', null, 401));


        const userDoc = await User.findById(user._id).select('groups').lean();
        if (!userDoc || !userDoc.groups || userDoc.groups.length === 0) {
            return res.json(sendResponse("No groups found for user", []));
        }

        const userGroupIds = userDoc.groups.map(g => g._id || g);

        const now = new Date();
        const offset = 60;
        const today = new Date(now.getTime() + offset * 60000);
        today.setUTCHours(0, 0, 0, 0);
        const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

        const sessions = await AttendanceSession.find({
            organization_id: user.organization_id,
            group: { $in: userGroupIds },
            start_time: { $gte: today, $lt: tomorrow }
        })
            .sort({ start_time: 1 })
            .lean(); 

        const results = await Promise.all(
            sessions.map(async (s) => {
                const hasCheckin = await Checkin.exists({
                    user_id: user._id,
                    attendance_session_id: s._id,
                    created_at: { $gte: today, $lt: tomorrow }
                });
                s.checkin_status = hasCheckin ? 'yes' : 'no';
                return s;
            })
        );

        res.json(sendResponse("Today's sessions retrieved successfully.", results));
    } catch (err) {
        console.error(err);
        res.status(500).json(sendResponse('Server error', null, 500));
    }
};

export const getAllSessionForSupervisor = async (req, res) => {
    try {
        const authUser = req.user;

        const sessions = await AttendanceSession.find({
            organization: authUser.organization,
            supervisor: authUser.id
        })
            // .populate('group')
            // .populate('supervisor')
            .sort({ start_time: -1 });

        res.status(200).json(sendResponse('Sessions fetched successfully.', sessions));
    } catch (err) {
        res.status(500).json(sendError(err.message));
    }
}

export const startSession = async (req, res) => {
    try {
        const { sessionId } = req.body;

        const session = await AttendanceSession.findOne({
            _id: sessionId,
        });

        if (!session) {
            return res.status(404).json(sendError('Session not found.'));
        }

        if (session.status !== 'scheduled') {
            return res.status(400).json(sendError('Only scheduled sessions can be started.'));
        }

        if (new Date() < new Date(session.start_time) || new Date() > new Date(session.end_time)) {
            return res.status(400).json(sendError('Session can only be started within the scheduled time range'));
        }

        session.status = 'ongoing';
        await session.save();

        res.status(200).json(sendResponse('Session started successfully.', session));
    } catch (err) {
        res.status(500).json(sendError(err.message));
    }
}

export const endSession = async (req, res) => {
    try {
        const { sessionId } = req.body;

        const session = await AttendanceSession.findOne({
            _id: sessionId,
        });

        if (!session) {
            return res.status(404).json(sendError('Session not found.'));
        }

        if (session.status !== 'ongoing') {
            return res.status(400).json(sendError('Only ongoing sessions can be ended.'));
        }

        session.status = 'ended';
        await session.save();

        res.status(200).json(sendResponse('Session ended successfully.', session));
    } catch (err) {
        res.status(500).json(sendError(err.message));
    }
}

export const CheckIntoSession = async (req, res) => {

}

export const Supervisorcreate = async (req, res) => {
    try {
        const { group, title, latitude, longitude, radius, start_time, end_time, building_name } = req.body;
        const authUser = req.user;

        const groups = await Group.findOne({ _id: group, organization: authUser.organization });
        if (!groups) {
            return res.status(403).json({ message: 'Invalid group for your organization.' });
        }

        if (authUser.role !== 'supervisor') {
            return res.status(403).json({ message: 'Only supervisors can create sessions.' });
        }

        const sessionExists = await AttendanceSession.findOne({
            $or: [
                {
                    group,
                    start_time: { $lt: end_time },
                    end_time: { $gt: start_time },
                    organization: authUser.organization
                },
                {
                    supervisor: authUser.id,
                    start_time: { $lt: end_time },
                    end_time: { $gt: start_time },
                    organization: authUser.organization
                }
            ]
        });

        if (sessionExists) {
            return res.status(400).json({ message: 'A session with the same group or supervisor already exists during that time.' });
        }

        const session = await AttendanceSession.create({
            group,
            start_time,
            supervisor: authUser.id,
            organization: authUser.organization,
            title,
            latitude,
            longitude,
            radius: radius || 50,
            end_time,
            building_name,
            status: 'scheduled'
        });

        res.status(201).json(sendResponse('Session created successfully.', session));
    } catch (error) {

        res.status(500).json(sendError(error.message));
    }
}