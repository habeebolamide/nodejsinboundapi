import { sendError, sendResponse } from "../helpers/helper.js";
import Users from "../models/users.js";
import bcrypt from 'bcryptjs';
import { signToken } from "../utils/jwt.js";


export const Login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await Users.findOne({ email }).populate('organization').populate('userType');
        if (!user) {
            return res.status(400).json(sendError('Invalid email or password.'));
        }

        const isMatch = bcrypt.compareSync(password, user.password);
        if (!isMatch) {
            return res.status(400).json(sendError('Invalid email or password.'));
        }

        const token = signToken({
            id: user._id,
            email: user.email,
            organization: user.organization._id,
            role: user.userType.name,
        });

        res.status(200).json(sendResponse('Login successful.', {
            token, 
            user: {
                id: user._id,
                email: user.email,
                organization: user.organization.name, 
                role: user.userType.name,
            },
        }));
    } catch (error) {
        res.status(500).json(sendError(error.message || 'Server Error'));
    }
};
