// controllers/groupController.js
import { validationResult } from 'express-validator';
import Group from '../models/group.js';
import User from '../models/users.js';
import { parseCSV } from '../utils/csvParser.js';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import { sendError, sendResponse } from '../helpers/helper.js';
import mongoose from 'mongoose';


// CREATE GROUP + IMPORT CSV
export const createGroupWithCSV = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json(sendError('Validation Error', errors.mapped()));

  const { name } = req.body;
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
      name,
      organization: authUser.organization,
      total_members: 0,
    });

    let imported = 0;
    const studentType = await mongoose.model('UserType').findOne({ name: 'member' });

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
        userType: studentType._id,
        groups: [group._id],
      });

      await Group.updateOne(
        { _id: group._id },
        { $push: { users: user._id }, $inc: { total_members: 1 } }
      );

      imported++;
    }

    // Cleanup
    fs.unlinkSync(filePath);

    res.status(201).json(sendResponse('Group created & users imported', { imported_users: imported }, 201));
  } catch (err) {
    if (req.file) fs.unlinkSync(req.file.path);
    console.error(err);
    res.status(500).json(sendError('Import failed', { error: err.message }));
  }
};

// GET ALL GROUPS (with users)
export const getAllGroups = async (req, res) => {
  try {
    const groups = await Group.find().populate('users', 'name email user_id');
    res.json(sendResponse('Groups retrieved', groups));
  } catch (err) {
    res.status(500).json(sendError('Server error'));
  }
};

// GET ORG GROUPS
export const getOrgGroups = async (req, res) => {
  try {
    const groups = await Group.find({ organization: req.user.organization });
    if (!groups.length) return res.status(404).json(sendError('No groups found', [], 404));
    res.json(sendResponse('Groups retrieved', groups));
  } catch (err) {
    res.status(500).json(sendError('Server error'));
  }
};