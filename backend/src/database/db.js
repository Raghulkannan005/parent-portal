import mongoose from "mongoose"
import dotenv from "dotenv"

dotenv.config()

const url = process.env.MONGO_URI

async function connectdb(){
    await mongoose.connect(url)
    .then(()=>{
        console.log("Database is Connected ✅")
    })
    .catch((err)=>{
        console.log("Database Error : ",err)
    })
}
export default connectdb