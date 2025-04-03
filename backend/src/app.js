import express from "express"
import cors from "cors"
import mongoSanitize from 'express-mongo-sanitize';

import authRoutes from "./routes/authRoutes.js"
import studentRoutes from "./routes/studentRoutes.js"
import homeworkRoutes from "./routes/homeworkRoutes.js"
import messageRoutes from "./routes/messageRoutes.js"
import userRoutes from "./routes/userRoutes.js"

const app = express()
app.use(cors())
app.use(express.json())
app.use(mongoSanitize());


app.get('/', (req,res)=>{
    res.send("Hi, I am Parent Portal Backend Server! \n Server is Running perfectly.")
})

app.use('/api/auth', authRoutes)
app.use('/api/students', studentRoutes)
app.use('/api/homework', homeworkRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/users', userRoutes)

export default app
