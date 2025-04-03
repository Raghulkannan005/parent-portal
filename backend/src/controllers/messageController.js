import { getMessages, getConversation, sendMessage, markAsRead } from "../services/messageService.js";

export const getUserMessages = async (req, res) => {
  try {
    const messages = await getMessages(req.user.userId);
    return res.status(200).json(messages);
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
};

export const getMessageConversation = async (req, res) => {
  try {
    const { otherUserId } = req.params;
    const conversation = await getConversation(req.user.userId, otherUserId);
    return res.status(200).json(conversation);
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
};

export const createMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    
    if (!receiverId || !content) {
      return res.status(400).json({ error: "Receiver ID and content are required" });
    }
    
    const result = await sendMessage(req.user.userId, receiverId, content);
    return res.status(201).json(result);
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
};

export const readMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const result = await markAsRead(messageId, req.user.userId);
    
    if (result.error) {
      return res.status(400).json({ error: result.error });
    }
    
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
};