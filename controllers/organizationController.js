import Organization from '../models/organizationModel.js';
import UserType from '../models/userType.js';
import User from '../models/users.js';
import bcrypt from 'bcryptjs';
import { signToken } from '../utils/jwt.js';
import { validationResult } from 'express-validator';
import { sendResponse, sendError } from '../helpers/helper.js';
import { parseCSV } from '../utils/csvParser.js';
import Group from '../models/group.js';
import GroupUser from '../models/groupUser.js';
import mongoose from 'mongoose';
import fs from 'fs';


export const createOrganization = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json(sendError('Validation Error.', errors.mapped()));
    }

    const { name, slug, email, type, address, password } = req.body;

    try {
        // 1. Create Organization
        const organization = await Organization.create({
            name,
            slug,
            email,
            type,
            address: address || null,
        });

        // 2. Get or create "admin" UserType
        let adminType = await UserType.findOne({ name: 'admin' });
        if (!adminType) {
            adminType = await UserType.create({ name: 'admin' });
        }

        // 3. Create Admin User
        const user = await User.create({
            name: `Admin of ${organization.name}`,
            email: organization.email,
            password: bcrypt.hashSync(password, 10),
            user_id: `admin_${organization.slug}`,
            organization: organization._id,
            userType: adminType._id,
        });

        // 4. Generate JWT
        const token = signToken({
            id: user._id,
            organization: organization._id,
        });

        // 5. Respond
        res.status(201).json(sendResponse('Organization and admin created.', {
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                user_id: user.user_id,
            },
            organization: {
                id: organization._id,
                name: organization.name,
                slug: organization.slug,
                type: organization.type,
            },
        }, 201));

    } catch (err) {
        if (err.code === 11000) {
            const field = Object.keys(err.keyValue)[0];
            return res.status(400).json(sendError(`${field} already exists.`));
        }
        console.error(err);
        res.status(500).json(sendError('Server error.'));
    }
}

export const loginOrganization = async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Find User by email
        const user = await User.findOne({ email }).populate('organization').populate('userType');
        if (!user) {
            return res.status(400).json(sendError('Invalid email or password.'));
        }

        // 2. Check password
        const isMatch = bcrypt.compareSync(password, user.password);
        if (!isMatch) {
            return res.status(400).json(sendError('Invalid email or password.'));
        }

        // 3. Generate JWT
        const token = signToken({
            id: user._id,
            email: user.email,
            organization: user.organization._id,
            role: user.userType.name,
        });

        // 4. Respond
        res.status(200).json(sendResponse('Login successful.', {
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                user_id: user.user_id,
                organization: {
                    id: user.organization._id,
                    name: user.organization.name,
                    slug: user.organization.slug,
                    type: user.organization.type,
                },
            },
        }));

    } catch (err) {
        console.log("Error", err);
        res.status(500).json(sendError(err.message || 'Server error.'));
    }
}

export const uploadSupervisors = async (req, res) => {
    const file = req.file;
    if (!file) return res.status(400).json(sendError('File is required'));

    try {
        const authUser = req.user;
        const filePath = file.path;
        const rows = await parseCSV(filePath);

        if (rows.length === 0) {
            fs.unlinkSync(filePath);
            return res.status(400).json(sendError('CSV is empty'));
        }

        const group = await Group.create({
            name: "Supervisors",
            organization: authUser.organization,
            total_members: 0,
        });

        let imported = 0;
        const userType = await mongoose.model('UserType').findOne({ name: 'supervisor' });


        for (const row of rows) {
            const cleanRow = Object.fromEntries(
                Object.entries(row).map(([k, v]) => [k.toLowerCase().trim(), v.trim()])
            );

            if (!cleanRow.name || !cleanRow.email || !cleanRow.user_id) {
                console.warn('Skipped row (missing fields):', cleanRow);
                continue;
            }

            const exists = await User.findOne({
                $or: [{ email: cleanRow.email }, { user_id: cleanRow.user_id }],
            });
            if (exists) {
                console.warn('Skipped duplicate:', cleanRow.email);
                continue;
            }

            const user = await User.create({
                name: cleanRow.name,
                email: cleanRow.email,
                user_id: cleanRow.user_id,
                password: bcrypt.hashSync('12345678', 10),
                organization: authUser.organization,
                userType: userType._id,
                groups: [group._id],
            });

            await GroupUser.create({
                group: group._id,
                user: user._id,
            });

            await Group.updateOne(
                { _id: group._id },
                { $inc: { total_members: 1 } }
            );

            imported++;
        }

        fs.unlinkSync(filePath);

        res.status(201).json(sendResponse('Supervisors uploaded successfully', { imported_users: imported }, 201));
    } catch (err) {
        console.error(err);
        res.status(500).json(sendError(err.message));
    }
}

export const getSupervisors = async (req, res) => {
    try {
        const authUser = req.user;
        const supervisorType = await mongoose.model('UserType').findOne({ name: 'supervisor' });

        const supervisors = await User.find({
            organization: authUser.organization,
            userType: supervisorType._id,
        }).select('-password');

        res.status(200).json(sendResponse('Supervisors fetched successfully', { supervisors }));
    } catch (err) {
        console.error(err);
        res.status(500).json(sendError(err.message));
    }
}

export const getOrganizationSupervisors = async (req, res) => {
    try {
        const authUser = req.user;

        const supervisorType = await mongoose.model('UserType').findOne({ name: 'supervisor' });

        const supervisors = await User.find({
            organization: authUser.organization,
            userType: supervisorType._id,
        }).select('-password');

        res.status(200).json(sendResponse('Supervisors fetched successfully', { supervisors }));
    } catch (err) {
        console.error(err);
        res.status(500).json(sendError(err.message));
    }
}