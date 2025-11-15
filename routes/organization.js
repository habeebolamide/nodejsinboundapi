import express from 'express';
import { rateLimiter } from '../middleware/rateLimit.js';
import { validateCreateOrganization } from '../middleware/validateOrganization.js';
import { createOrganization, loginOrganization } from '../controllers/organizationController.js';


const router = express.Router();


router
    .post('/create', rateLimiter, validateCreateOrganization,createOrganization)
    .post('/login',rateLimiter,loginOrganization)

export default router;