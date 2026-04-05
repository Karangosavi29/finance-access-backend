import mongoose, { Schema } from "mongoose"

const transactionSchema = new Schema(
    {
        amount: {
            type: Number,
            required: [true, "Amount is required"],
            min: [0, "Amount cannot be negative"]
        },
        type: {
            type: String,
            enum: ["income", "expense"],
            required: [true, "Transaction type is required"]
        },
        category: {
            type: String,
            required: [true, "Category is required"],
            trim: true,
            lowercase: true
        },
        date: {
            type: Date,
            required: [true, "Date is required"],
            default: Date.now
        },
        notes: {
            type: String,
            trim: true,
            default: ""
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    { timestamps: true }
)

export const Transaction = mongoose.model("Transaction", transactionSchema)