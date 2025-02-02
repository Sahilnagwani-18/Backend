import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
const app =express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));//for defing middleWare

app.use(express.json({limit:"16kb"}));
app.use(express.urlencoded({extended:true,limit:"16kb"}));
app.use(express.static("public"));
app.use(cookieParser( ))


//Routes Import 

import userRouter from './routes/user.routes.js';


//Routes Declaration
//Transfer The Flow To localhost:3000/users and Now it will Go to userRouter in /routes/userRouter.routes.js
//Now we need to Define api and version also 

app.use("/api/v2/users",userRouter);
//Final route here made up => http://localhost:3000/api/v2/users





export {app}