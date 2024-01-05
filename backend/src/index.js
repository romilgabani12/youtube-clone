import connectDB from "./db/index.js";
import { app } from "./app.js";
import dotenv from "dotenv";
// require('dotenv').config({path: './env'})


dotenv.config({
    path: "./.env"
})






connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000 , () => {
        console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
    })
    
})
.catch((error) => {
    console.log("MongoDB connection failed !!! ", error);
})