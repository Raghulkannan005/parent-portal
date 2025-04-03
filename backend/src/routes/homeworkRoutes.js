import express from "express";
import { getHomework, sendHomework } from "../controllers/homeworkController.js";
import { authenticateUser, authorizeRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get homework by class and section
router.get('/', authenticateUser, getHomework);

// Add homework (teachers/admin only)
router.post('/', authenticateUser, authorizeRole(['teacher', 'admin']), sendHomework);

export default router;