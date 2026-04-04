import mongoose from "mongoose";
import connectDB from "./db/db.js";
import dotenv from 'dotenv';
import express from "express";

const app = express();
dotenv.config();  






connectDB()
.then(() => {
    app.listen(process.env.PORT || 3000, () =>{
        console.log(`server is running on port :${process.env.PORT}` );
    })
})
.catch( (err) => {
    console.log("mongo Db connection failed !!! ", err)
})