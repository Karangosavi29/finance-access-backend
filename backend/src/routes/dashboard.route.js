import { Router } from "express";
import {
    getSummary,
    getCategoryWiseTotals,
    getRecentTransactions,
    getMonthlyTrends
} from "../controllers/dashboard.controller.js";
import { verifyJWT, authorizeRoles } from "../middleware/auth.middleware.js";

const router = Router()

// all dashboard routes are protected - must be logged in
router.use(verifyJWT)

// all roles can access these routes
router.route("/summary").get(getSummary)
router.route("/categories").get(getCategoryWiseTotals)
router.route("/recent").get(getRecentTransactions)

// only analyst and admin can access monthly trends
router.route("/trends").get(authorizeRoles("admin", "analyst"), getMonthlyTrends)

export default router