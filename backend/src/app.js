import express from "express"
import cors from "cors"
import mongoSanitize from 'express-mongo-sanitize';

import authRoutes from "./routes/authRoutes.js"
import studentRoutes from "./routes/studentRoutes.js"
import homeworkRoutes from "./routes/homeworkRoutes.js"
import messageRoutes from "./routes/messageRoutes.js"
import userRoutes from "./routes/userRoutes.js"

const app = express()

// Configure CORS to allow any origin
app.use(cors({
  origin: '*',  // Accept requests from any origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// Parse JSON bodies
app.use(express.json())

// Sanitize data to prevent NoSQL injection
app.use(mongoSanitize());

// API status route
app.get('/api', (req, res) => {
  res.json({
    status: 'success',
    message: 'Parent Portal API is running',
    timestamp: new Date()
  })
})

// Simple route for server status
app.get('/', (req, res) => {
  res.send("Parent Portal Backend Server is running properly!")
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/students', studentRoutes)
app.use('/api/homework', homeworkRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/users', userRoutes)

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    status: 'error',
    message: `Cannot ${req.method} ${req.url}`
  })
})

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  const statusCode = err.statusCode || 500
  res.status(statusCode).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
    errorCode: err.code || 'UNKNOWN_ERROR',
    path: req.path
  })
})

export default app
