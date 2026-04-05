import { Router } from "express";
import {
    createTransaction,
    getAllTransactions,
    getTransactionById,
    updateTransaction,
    deleteTransaction
} from "../controllers/transaction.controller.js";
import { verifyJWT, authorizeRoles } from "../middleware/auth.middleware.js";

const router = Router()


// all roles can view transactions
router.route("/").get(getAllTransactions)
router.route("/:id").get(getTransactionById)

// analyst and admin can create and update
router.route("/").post(verifyJWT,authorizeRoles("admin", "analyst"), createTransaction)
router.route("/:id").patch(verifyJWT,authorizeRoles("admin", "analyst"), updateTransaction)

// only admin can delete
router.route("/:id").delete(verifyJWT,authorizeRoles("admin"), deleteTransaction)

export default router