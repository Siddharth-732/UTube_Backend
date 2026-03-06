// require('dotenv').config();
import dotenv from "dotenv";
dotenv.config({path: "./env"});
import connectDB from "./db/index.js";
connectDB();

import express from "express";
import mongoose from "mongoose";
console.log(process.env.MONGODB_URI);