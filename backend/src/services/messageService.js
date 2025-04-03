import Message from "../models/messageModel.js";

export const getMessages = async (userId) => {
  const messages = await Message.find({
    $or: [{ sender: userId }, { receiver: userId }]
  })
    .sort({ createdAt: -1 })
    .populate('sender', 'name')
    .populate('receiver', 'name');
  return messages;
};

export const getConversation = async (user1Id, user2Id) => {
  const messages = await Message.find({
    $or: [
      { sender: user1Id, receiver: user2Id },
      { sender: user2Id, receiver: user1Id }
    ]
  })
    .sort({ createdAt: 1 })
    .populate('sender', 'name')
    .populate('receiver', 'name');
  return messages;
};

export const sendMessage = async (senderUserId, receiverUserId, content) => {
  const newMessage = new Message({
    sender: senderUserId,
    receiver: receiverUserId,
    content
  });
  
  await newMessage.save();
  return newMessage;
};

export const markAsRead = async (messageId, userId) => {
  const message = await Message.findById(messageId);
  
  if (!message) {
    return { error: "Message not found" };
  }
  
  if (message.receiver.toString() !== userId.toString()) {
    return { error: "Unauthorized to mark this message as read" };
  }
  
  message.isRead = true;
  await message.save();
  return message;
};