import { sendError, sendResponse } from "../helpers/helper.js";
import Users from "../models/users.js";
import bcrypt from 'bcryptjs';
import { signToken } from "../utils/jwt.js";


export const Login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Find User by email
        const user = await Users.findOne({ email }).populate('organization').populate('userType');
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
            token, // Include the token in the response
            user: {
                id: user._id,
                email: user.email,
                organization: user.organization.name, // Assuming the organization has a name field
                role: user.userType.name, // Assuming userType has a name field
            },
        }));
    } catch (error) {
        // Handle any potential errors
        console.error(error);
        res.status(500).json(sendError(error.message || 'Server Error'));
    }
};
