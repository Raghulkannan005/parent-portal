import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import path from "path";
import { fileURLToPath } from "url";
import connectdb from "./db.js";

// Get directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// Import models
import User from "../models/userModel.js";
import Student from "../models/studentModel.js";
import Homework from "../models/homeworkModel.js";
import Message from "../models/messageModel.js";

async function setupDatabase() {
  try {
    // Connect to database
    await connectdb();
    console.log("Connected to database");

    // Clear existing data
    await User.deleteMany({});
    await Student.deleteMany({});
    await Homework.deleteMany({});
    await Message.deleteMany({});
    console.log("Cleared existing data");

    // Create users with hashed passwords
    const passwordHash = await bcrypt.hash("password", 10);

    const adminUser = await User.create({
      name: "Admin User",
      email: "admin@example.com",
      password: passwordHash,
      phone: "555-0100",
      role: "admin"
    });

    const teacherUser = await User.create({
      name: "Mary Teacher",
      email: "teacher@example.com",
      password: passwordHash,
      phone: "555-0200",
      role: "teacher"
    });

    const parentUser = await User.create({
      name: "John Parent",
      email: "parent@example.com",
      password: passwordHash,
      phone: "555-0300",
      role: "parent"
    });

    console.log("Created users");

    // Create students
    const student1 = await Student.create({
      name: "Alex Smith",
      rollNumber: "101",
      class: "10",
      section: "A",
      parentId: parentUser._id,
      attendance: { present: 42, absent: 3, total: 45 }
    });

    const student2 = await Student.create({
      name: "Emma Smith",
      rollNumber: "102",
      class: "8",
      section: "B",
      parentId: parentUser._id,
      attendance: { present: 40, absent: 5, total: 45 }
    });

    console.log("Created students");

    // Create homework
    const homework1 = await Homework.create({
      title: "Math Assignment",
      description: "Complete problems 1-20 from Chapter 5",
      class: "10",
      section: "A",
      subject: "Mathematics",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      uploadedBy: teacherUser._id
    });

    const homework2 = await Homework.create({
      title: "Science Project",
      description: "Prepare a presentation on renewable energy",
      class: "10",
      section: "A",
      subject: "Science",
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      uploadedBy: teacherUser._id
    });

    console.log("Created homework assignments");

    // Create messages
    const message1 = await Message.create({
      sender: teacherUser._id,
      receiver: parentUser._id,
      content: "Hello! This is about your child's progress.",
      isRead: true
    });

    const message2 = await Message.create({
      sender: parentUser._id,
      receiver: teacherUser._id,
      content: "Thank you for letting me know. Can we discuss further?",
      isRead: false
    });

    console.log("Created messages");

    console.log("Database setup complete!");
    console.log("\nTest accounts:");
    console.log("Parent: email: parent@example.com, password: password");
    console.log("Teacher: email: teacher@example.com, password: password");
    console.log("Admin: email: admin@example.com, password: password");

    // Disconnect after setup
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Error setting up database:", error);
    process.exit(1);
  }
}

// Run the setup function
setupDatabase(); 