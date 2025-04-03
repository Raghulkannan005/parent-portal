import express from "express";
import { 
  getAvailableUsers,
  getUserById, 
  updateUser,
  updatePassword
} from "../controllers/userController.js";
import { authenticateUser } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get('/available', authenticateUser, getAvailableUsers);
router.get('/:id', authenticateUser, getUserById);
router.put('/:id', authenticateUser, updateUser);
router.put('/:id/password', authenticateUser, updatePassword);

export default router;