// routes/groupRoutes.js
import express from 'express';
import { protect } from '../middleware/auth.js';
import { rateLimiter } from '../middleware/rateLimit.js';
import { CheckIntoSession, createSession, endSession, getAll, getAllSessionForSupervisor, getTodaySessions, startSession, Supervisorcreate } from '../controllers/sessionController.js';
import { validateCreateSession } from '../middleware/validateSession.js';

const router = express.Router();

router.use(protect); 

router
    .post('/create', rateLimiter,protect, validateCreateSession, createSession)
    .get('/get_sessions',protect,getAll)
    .get('/get_today_sessions',protect,getTodaySessions)
    .get('/get_sessions_for_supervisors',protect,getAllSessionForSupervisor)
    .post('/start_session',protect,startSession)
    .post('/end_session',protect,endSession)
    .post('/checkin',protect,CheckIntoSession)
    .post('/supervisor_create',protect,Supervisorcreate);
export default router;