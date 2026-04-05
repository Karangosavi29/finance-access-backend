import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/Apierror.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import { Transaction } from "../models/transaction.Model.js";

const getSummary = asyncHandler(async (req, res) => {
    // aggregate all transactions
    // calculate total income - sum of all income type transactions
    // calculate total expenses - sum of all expense type transactions
    // calculate net balance - total income minus total expenses
    // return res

    const result = await Transaction.aggregate([
        {
            $group: {
                _id: "$type",
                total: { $sum: "$amount" }
            }
        }
    ])

    let totalIncome = 0
    let totalExpenses = 0

    result.forEach((item) => {
        if (item._id === "income") totalIncome = item.total
        if (item._id === "expense") totalExpenses = item.total
    })

    const netBalance = totalIncome - totalExpenses

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { totalIncome, totalExpenses, netBalance },
                "Summary fetched successfully"
            )
        )
})

const getCategoryWiseTotals = asyncHandler(async (req, res) => {
    // aggregate transactions grouped by category and type
    // calculate total amount per category
    // sort by total amount descending
    // return res

    const result = await Transaction.aggregate([
        {
            $group: {
                _id: { category: "$category", type: "$type" },
                total: { $sum: "$amount" },
                count: { $sum: 1 }
            }
        },
        {
            $group: {
                _id: "$_id.category",
                breakdown: {
                    $push: {
                        type: "$_id.type",
                        total: "$total",
                        count: "$count"
                    }
                },
                categoryTotal: { $sum: "$total" }
            }
        },
        {
            $sort: { categoryTotal: -1 }
        }
    ])

    if (!result.length) {
        throw new ApiError(404, "No transactions found")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                result,
                "Category wise totals fetched successfully"
            )
        )
})

const getRecentTransactions = asyncHandler(async (req, res) => {
    // fetch last 5 transactions sorted by date descending
    // populate createdBy with user name and email
    // return res

    const transactions = await Transaction.find()
        .populate("createdBy", "name email role")
        .sort({ date: -1 })
        .limit(5)

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                transactions,
                "Recent transactions fetched successfully"
            )
        )
})

const getMonthlyTrends = asyncHandler(async (req, res) => {
    // aggregate transactions grouped by year, month and type
    // calculate total income and expense per month
    // sort by year and month ascending
    // return res

    const result = await Transaction.aggregate([
        {
            $group: {
                _id: {
                    year: { $year: "$date" },
                    month: { $month: "$date" },
                    type: "$type"
                },
                total: { $sum: "$amount" }
            }
        },
        {
            $group: {
                _id: {
                    year: "$_id.year",
                    month: "$_id.month"
                },
                breakdown: {
                    $push: {
                        type: "$_id.type",
                        total: "$total"
                    }
                }
            }
        },
        {
            $sort: {
                "_id.year": 1,
                "_id.month": 1
            }
        },
        {
            $project: {
                _id: 0,
                year: "$_id.year",
                month: "$_id.month",
                breakdown: 1
            }
        }
    ])

    if (!result.length) {
        throw new ApiError(404, "No transactions found")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                result,
                "Monthly trends fetched successfully"
            )
        )
})

export { getSummary, getCategoryWiseTotals, getRecentTransactions, getMonthlyTrends }