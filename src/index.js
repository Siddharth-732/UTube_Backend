// require('dotenv').config();
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";
dotenv.config({
  path: "./.env",
});

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`server is running : ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("MONGO db connection failed", err);
  });

// Another way of writing this can be--

/*
  const startServer = async ()=>{
    try{
      await connectDB();
      app.listen(process.env.PORT || 8000, () => 
        {
      console.log(`server is running : ${process.env.PORT}`)
      }
      )
    }
    catch (err){
      console.log("MONGO db connection failed", err);
    }
    }
    startServer();
  */