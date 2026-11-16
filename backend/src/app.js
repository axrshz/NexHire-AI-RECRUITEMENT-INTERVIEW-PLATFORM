import express from "express";
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan'


const app = express();
app.use(morgan("dev"));//creates a log(record) of all the operations on the server
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true
}));


//user routes
import userRoutes from "./routes/user.routes.js"
app.use("/api/v1/user", userRoutes)


export default app;
