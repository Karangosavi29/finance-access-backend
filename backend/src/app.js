import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.route.js";
import userRouter from "./routes/user.route.js";
import transactionRouter from "./routes/transaction.route.js"
import dashboardRouter from "./routes/dashboard.route.js"
const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}))

app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(cookieParser())


// routes
app.use("/api/v1/auth", authRouter)
app.use("/api/v1/users", userRouter)
app.use("/api/v1/transactions", transactionRouter)  
app.use("/api/v1/dashboard", dashboardRouter) 
// global error handler
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500
    const message = err.message || "Something went wrong"
    return res.status(statusCode).json({
        success: false,
        statusCode,
        message,
        errors: err.errors || []
    })
})

export default app