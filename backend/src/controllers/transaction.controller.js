import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/Apierror.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import { Transaction } from "../models/transaction.Model.js";

const createTransaction = asyncHandler(async (req, res) => {
    // get transaction details from request body
    // validation - empty fields
    // validate amount is a positive number
    // validate type is income or expense
    // create transaction in db with createdBy as logged in user
    // return res

    const { amount, type, category, date, notes } = req.body

    if (!amount || !type || !category) {
        throw new ApiError(400, "Amount, type and category are required")
    }

    if (isNaN(amount) || Number(amount) <= 0) {
        throw new ApiError(400, "Amount must be a positive number")
    }

    const allowedTypes = ["income", "expense"]
    if (!allowedTypes.includes(type)) {
        throw new ApiError(400, "Type must be either income or expense")
    }

    const transaction = await Transaction.create({
        amount: Number(amount),
        type,
        category: category.toLowerCase(),
        date: date || Date.now(),
        notes: notes || "",
        createdBy: req.user._id
    })

    if (!transaction) {
        throw new ApiError(500, "Something went wrong while creating the transaction")
    }

    return res
        .status(201)
        .json(new ApiResponse(201, transaction, "Transaction created successfully"))
})

const getAllTransactions = asyncHandler(async (req, res) => {
    // get filter query params from request (type, category, startDate, endDate)
    // get pagination params (page, limit) with defaults
    // build filter object based on provided query params
    // fetch transactions from db with filters and pagination
    // return res with pagination meta

    const { type, category, startDate, endDate, page = 1, limit = 10 } = req.query

    const filter = {}

    if (type) {
        const allowedTypes = ["income", "expense"]
        if (!allowedTypes.includes(type)) {
            throw new ApiError(400, "Type must be either income or expense")
        }
        filter.type = type
    }

    if (category) {
        filter.category = category.toLowerCase()
    }

    if (startDate || endDate) {
        filter.date = {}
        if (startDate) filter.date.$gte = new Date(startDate)
        if (endDate) filter.date.$lte = new Date(endDate)
    }

    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    const skip = (pageNum - 1) * limitNum

    const totalCount = await Transaction.countDocuments(filter)
    const totalPages = Math.ceil(totalCount / limitNum)

    const transactions = await Transaction.find(filter)
        .populate("createdBy", "name email role")
        .sort({ date: -1 })
        .skip(skip)
        .limit(limitNum)

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    transactions,
                    pagination: {
                        totalCount,
                        totalPages,
                        currentPage: pageNum,
                        limit: limitNum
                    }
                },
                "Transactions fetched successfully"
            )
        )
})

const getTransactionById = asyncHandler(async (req, res) => {
    // get transaction id from params
    // find transaction in db
    // populate createdBy with user name and email
    // return res

    const { id } = req.params

    const transaction = await Transaction.findById(id).populate(
        "createdBy",
        "name email role"
    )

    if (!transaction) {
        throw new ApiError(404, "Transaction not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, transaction, "Transaction fetched successfully"))
})

const updateTransaction = asyncHandler(async (req, res) => {
    // get transaction id from params
    // get fields to update from body
    // validate type if provided
    // validate amount if provided
    // find and update transaction in db
    // return res

    const { id } = req.params
    const { amount, type, category, date, notes } = req.body

    if (type) {
        const allowedTypes = ["income", "expense"]
        if (!allowedTypes.includes(type)) {
            throw new ApiError(400, "Type must be either income or expense")
        }
    }

    if (amount !== undefined) {
        if (isNaN(amount) || Number(amount) <= 0) {
            throw new ApiError(400, "Amount must be a positive number")
        }
    }

    const updatedFields = {}
    if (amount !== undefined) updatedFields.amount = Number(amount)
    if (type) updatedFields.type = type
    if (category) updatedFields.category = category.toLowerCase()
    if (date) updatedFields.date = new Date(date)
    if (notes !== undefined) updatedFields.notes = notes

    const transaction = await Transaction.findByIdAndUpdate(
        id,
        updatedFields,
        { new: true, runValidators: true }
    ).populate("createdBy", "name email role")

    if (!transaction) {
        throw new ApiError(404, "Transaction not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, transaction, "Transaction updated successfully"))
})

const deleteTransaction = asyncHandler(async (req, res) => {
    // get transaction id from params
    // find and delete transaction from db
    // return res

    const { id } = req.params

    const transaction = await Transaction.findByIdAndDelete(id)

    if (!transaction) {
        throw new ApiError(404, "Transaction not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Transaction deleted successfully"))
})

export {
    createTransaction,
    getAllTransactions,
    getTransactionById,
    updateTransaction,
    deleteTransaction
}