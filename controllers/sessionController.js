import Group from "../models/group.js";
import User from "../models/users.js";
import AttendanceSession from "../models/attendanceSession.js";
import { sendError, sendResponse } from "../helpers/helper.js";
import GroupUser from "../models/groupUser.js";


export const createSession = async (req, res) => {
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
}

export const getAll = async (req, res) => {
    const authUserid = req.user.id;

    try {
        const authUser = await User.findById(authUserid).populate('userType');

        
        const groupUsers = await GroupUser.find({ user: authUser._id }).populate('group');
        const groupIds = groupUsers.map(groupUser => groupUser.group._id);

        console.log(groupIds);

        let sessionsQuery = AttendanceSession.find({ organization: authUser.organization })
            .populate('group')
            .populate('supervisor')
            .sort({ start_time: -1 });

        if (authUser.userType.name === 'supervisor') {
            sessionsQuery = sessionsQuery.where('supervisor').equals(authUser._id);
        } else if (authUser.userType.name === 'member') {
            sessionsQuery = sessionsQuery.where('group').in(groupIds);
        }

        const sessions = await sessionsQuery.exec();

        res.status(200).json(sendResponse('Sessions fetched successfully.', sessions));

    } catch (err) {
        // Handle errors
        return res.status(500).json({
            message: 'Internal Server Error',
            error: err.message
        });
    }
}

export const getTodaySessions = async (req, res) => {
    try {
        const authUser = req.user;
        const today = moment().startOf('day').toDate(); 

        const sessions = await AttendanceSession.find({
            organization_id: authUser.organization_id,
            start_time: { $gte: today, $lt: moment(today).endOf('day').toDate() }
        })
        .populate('group')
        .populate('supervisor')
        .sort({ start_time: 1 }); 

        const sessionsWithCheckinStatus = await Promise.all(sessions.map(async (session) => {
            const checkin = await Checkin.findOne({
                user_id: authUser.id,
                attendance_session_id: session._id,
                created_at: { $gte: moment().startOf('day').toDate(), $lt: moment().endOf('day').toDate() }
            });

            session.checkin_status = checkin ? 'yes' : 'no';

            return session;
        }));

        return sendResponse(res, 'Today\'s sessions retrieved successfully.', sessionsWithCheckinStatus, 200);
    } catch (err) {
        console.error(err);
        return sendResponse(res, 'Error retrieving sessions.', null, 500);
    }
};

