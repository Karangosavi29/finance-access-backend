import { Router } from "express";
import {
    getAllUsers,
    getUserById,
    updateUserRole,
    updateUserStatus,
    deleteUser,
} from "../controllers/user.controller.js";
import { verifyJWT, authorizeRoles } from "../middleware/auth.middleware.js";

const router = Router();


router.route("/").get(verifyJWT, authorizeRoles("admin"), getAllUsers);

router.route("/:id")
    .get(verifyJWT, authorizeRoles("admin"), getUserById)
    .delete(verifyJWT, authorizeRoles("admin"), deleteUser);

router.route("/:id/role").patch(verifyJWT, authorizeRoles("admin"), updateUserRole);
router.route("/:id/status").patch(verifyJWT, authorizeRoles("admin"), updateUserStatus);

export default router;