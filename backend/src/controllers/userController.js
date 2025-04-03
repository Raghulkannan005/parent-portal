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
    
    // Make sure user can only update their own profile
    if (req.params.id !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: "Unauthorized" });
    }
    
    const updates = { name, email, phone };
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    return res.status(200).json(user);
  } catch (error) {
    console.error("Error in updateUser:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Make sure user can only update their own password
    if (req.params.id !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: "Unauthorized" });
    }
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    await user.save();
    
    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error in updatePassword:", error);
    return res.status(500).json({ error: "Server error" });
  }
};