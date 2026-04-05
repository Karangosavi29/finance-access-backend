import dotenv from 'dotenv'
dotenv.config()
import connectDB from "./db/db.js";
import app from "./app.js";  







connectDB()
.then(() => {
    app.listen(process.env.PORT || 3000, () =>{
        console.log(`server is running on port :${process.env.PORT}` );
    })
})
.catch( (err) => {
    console.log("mongo Db connection failed !!! ", err)
})