import connectDB from "./db/index.js";
import dotenv from "dotenv";
import {app} from './app.js'
dotenv.config({
    path:"./env"
})

connectDB()
.then(()=>{
    app.on("error",(error)=>{
        console.log("Error",error);
        throw error;
    })
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`server is running on Port ${process.env.PORT}`);
    });
})
.catch((err)=>{
    console.log("Mongo Db Connection Failed !",err);
})














































// reqiure('dotenv').config({path:"./env"})
//This will also work But to remove Inconsistancy we use import wala statement 


// Approach 1

// import express from "express";

// const app = express()
// ;(async()=>{
//     try{
//        await mongoose.connect(`${process.env.MONGODB_URI}`)
//        app.on("error",(error)=>{
//         console.error("Error :",error);
//         throw error;
//        })

//        app.listen(process.env.PORT,()=>{
//          console.log(`App is Listening on Port ${process.env.PORT}`);
//        })
//     }catch(error){
//         console.error("Error:",error);
//         throw error
//     }
// }) ()

