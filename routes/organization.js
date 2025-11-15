import express from 'express';
import { rateLimiter } from '../middleware/rateLimit.js';
import { validateCreateOrganization } from '../middleware/validateOrganization.js';
import { createOrganization, getOrganizationSupervisors, getSupervisors, loginOrganization, uploadSupervisors } from '../controllers/organizationController.js';
import { upload } from '../middleware/upload.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

 

router
    .post('/create', rateLimiter, validateCreateOrganization,createOrganization)
    .post('/login',rateLimiter,loginOrganization)
    .post('/supervisors/upload',protect, rateLimiter,upload.single('supervisor_csv'),uploadSupervisors)
    .get('/supervisors/getSupervisors',protect, rateLimiter,getSupervisors)
    .get('/supervisors/getOrganizationSupervisors',protect, rateLimiter,getOrganizationSupervisors);

export default router;