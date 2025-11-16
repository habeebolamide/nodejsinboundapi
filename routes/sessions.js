// routes/groupRoutes.js
import express from 'express';
import { protect } from '../middleware/auth.js';
import { rateLimiter } from '../middleware/rateLimit.js';
import { createSession, getAll, getTodaySessions } from '../controllers/sessionController.js';
import { validateCreateSession } from '../middleware/validateSession.js';

const router = express.Router();

router.use(protect); 

router
    .post('/create', rateLimiter,protect, validateCreateSession, createSession)
    .get('/get_sessions',protect,getAll)
    .get('/get_today_sessions',protect,getTodaySessions);

export default router;