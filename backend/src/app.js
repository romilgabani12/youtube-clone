import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))


// frontend -- get data in -- JSON 
app.use(express.json({limit : "16kb"}))

// frontend -- get data in URL
app.use(express.urlencoded({extended: true , limit : "16kb"}))

// store external file in static public folder -- like consider as own server
app.use(express.static("public"))

// to set cokkieParser()
app.use(cookieParser())



// routes import

import userRouter from "./routes/user.routes.js";
import subscriptionRoute from "./routes/subscription.routes.js";
import commentRoute from "./routes/comment.routes.js";
import tweetRoute from "./routes/tweet.routes.js";
import likeRoute from "./routes/like.routes.js";

// routes declaration

app.use("/api/v1/users" , userRouter );
app.use("/api/v1/subscription" , subscriptionRoute );
app.use("/api/v1/comment" , commentRoute );
app.use("/api/v1/tweet" , tweetRoute );
app.use("/api/v1/like" ,  likeRoute);


export { app }