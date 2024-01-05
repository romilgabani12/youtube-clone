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






export { app }