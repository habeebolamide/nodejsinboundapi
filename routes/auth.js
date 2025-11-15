import express from 'express';
import { rateLimiter } from '../middleware/rateLimit.js';
import { Login } from '../controllers/authController.js';



const router = express.Router();

router.post('/login', rateLimiter, Login);

export default router;