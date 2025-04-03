import app from "./src/app.js"
import dotenv from "dotenv"
import connectdb from "./src/database/db.js"

dotenv.config()

const PORT = process.env.PORT || 3000

connectdb()

app.listen( PORT, ()=>{
    console.log(` Server Running on Port : ${PORT} ` )
})