import express from "express";
import { 
  getUserMessages, 
  getMessageConversation, 
  createMessage, 
  readMessage 
} from "../controllers/messageController.js";
import { authenticateUser } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all messages for the logged in user
router.get('/', authenticateUser, getUserMessages);

// Get conversation between current user and another user
router.get('/conversation/:otherUserId', authenticateUser, getMessageConversation);

// Send a message
router.post('/', authenticateUser, createMessage);

// Mark a message as read
router.put('/:messageId/read', authenticateUser, readMessage);

export default router;