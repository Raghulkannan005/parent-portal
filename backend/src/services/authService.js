import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

const generateToken = (user) => {
    return jwt.sign(
        { 
            userId: user._id,
            role: user.role,
            name: user.name,
            email: user.email
        },
        JWT_SECRET,
        { expiresIn: '24h' }
    );
};

export const loginService = async (email, password) => {
    const user = await User.findOne({ email });
    if (user){
        if (await bcrypt.compare(password, user.password)) {
            const token = generateToken(user);
            return {
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            };
        }
        else{
            return { error: "Invalid credentials" };
        }
    }
    else {
        return { error: "User not found" };
    }
};

export const registerService = async (name, email, password, phone, role = "parent") => {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return { error: "User already exists" };
    }
    
    // Hash password before saving
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    const newUser = new User({ 
        name, 
        email, 
        password: hashedPassword, 
        phone, 
        role 
    });
    await newUser.save();
    
    const token = generateToken(newUser);
    return {
        token,
        user: {
            id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role
        }
    };
};