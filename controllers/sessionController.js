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

