// require('dotenv').config();
import dotenv from "dotenv";
dotenv.config({path: "./env"});
import connectDB from "./db/index.js";
import express from "express";
const app =express();
connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000, ()=>{
       console.log(`server is running : ${process.env.PORT}`); 
    })
})
.catch((err)=>{
    console.log('MONGO db connection failed', err);
})