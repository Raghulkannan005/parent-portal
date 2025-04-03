import { loginService, registerService } from "../services/authService.js";

export const login = (req, res) => {
    const {email, password} = req.body;
    
    // Add input validation
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email format" });
    }
    
    loginService(email, password)
        .then(user => {
            if (user.error) {
                return res.status(400).json(user);
            }
            return res.status(200).json(user);
        })
        .catch(err => res.status(500).json({ error: "Server error" }));
}

export const register = (req, res) => {
    const { name, email, password, phone } = req.body;
    
    if (!name || !email || !password || !phone) {
        return res.status(400).json({ error: "All fields are required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email format" });
    }
    
    if (password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters" });
    }
    
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
        return res.status(400).json({ error: "Phone must be 10 digits" });
    }
    
    registerService(name, email, password, phone)
        .then(user => {
            if (user.error) {
                return res.status(400).json(user);
            }
            return res.status(201).json(user);
        })
        .catch(err => res.status(500).json({ error: "Server error" }));
}