import express from 'express';
import { createOrgLimiter } from '../middleware/rateLimit.js';
import { validateCreateOrganization } from '../middleware/validateOrganization.js';
import { createOrganization, loginOrganization } from '../controllers/organizationController.js';


const router = express.Router();


router
    .post('/create', createOrgLimiter, validateCreateOrganization,createOrganization)
    .post('/login',loginOrganization)

export default router;