import express from "express";
import { 
  getStudents, 
  getStudent, 
  uploadStudentDetail, 
  updateAttendance 
} from "../controllers/studentController.js";
import { authenticateUser, authorizeRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get students (for parents: their own children, for teachers: filtered by class/section)
router.get('/', authenticateUser, getStudents);

// Get single student by ID
router.get('/:id', authenticateUser, getStudent);

// Add a new student (teachers/admin only)
router.post('/', authenticateUser, authorizeRole(['teacher', 'admin']), uploadStudentDetail);

// Update student attendance (teachers/admin only)
router.put('/:id/attendance', authenticateUser, authorizeRole(['teacher', 'admin']), updateAttendance);

export default router;