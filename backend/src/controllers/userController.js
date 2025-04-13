import User from "../models/userModel.js";
import bcrypt from "bcrypt";

export const getAvailableUsers = async (req, res) => {
  try {
    const currentUser = req.user.userId;
    
    // Get all users except current user
    const users = await User.find({ _id: { $ne: currentUser } })
      .select('_id name role');
    
    return res.status(200).json(users);
  } catch (error) {
    console.error("Error in getAvailableUsers:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password');
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    return res.status(200).json(user);
  } catch (error) {
    console.error("Error in getUserById:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    
    if (!name || !email || !phone) {
      return res.status(400).json({ error: "All fields are required" });
    }
    
    // Check if email already exists for another user
    const existingUser = await User.findOne({ 
      email, 
      _id: { $ne: req.user.userId } 
    });
    
    if (existingUser) {
      return res.status(400).json({ error: "Email already in use" });
    }
    
    const updated = await User.findByIdAndUpdate(
      req.user.userId,
      { name, email, phone },
      { new: true }
    ).select('-password');
    
    if (!updated) {
      return res.status(404).json({ error: "User not found" });
    }
    
    return res.status(200).json(updated);
  } catch (error) {
    console.error("Error in updateUser:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Current password and new password are required" });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }
    
    // Verify current password
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    
    if (!isMatch) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update password
    await User.findByIdAndUpdate(req.user.userId, { password: hashedPassword });
    
    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error in updatePassword:", error);
    return res.status(500).json({ error: "Server error" });
  }
};