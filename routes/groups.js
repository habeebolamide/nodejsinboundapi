// routes/groupRoutes.js
import express from 'express';
import { createGroupWithCSV, getAllGroups, getOrgGroups } from '../controllers/groupController.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { validateCreateGroup } from '../middleware/validateGroup.js';
import { rateLimiter } from '../middleware/rateLimit.js';

const router = express.Router();

router.use(protect); // All routes protected

router
    .post('/create', rateLimiter, upload.single('file'), validateCreateGroup, createGroupWithCSV)
    .get('/getAll', getAllGroups)
    .get('/get_org_groups', getOrgGroups);

export default router;