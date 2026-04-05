import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/Apierror.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import { User } from "../models/user.Model.js";

const getAllUsers = asyncHandler(async (req, res) => {
    // only admin can access this route (enforced in middleware)
    // get all users from db
    // exclude password and refreshTokens
    // return res

    const users = await User.find().select("-password -refreshTokens");

    return res
        .status(200)
        .json(new ApiResponse(200, users, "All users fetched successfully"));
});

const getUserById = asyncHandler(async (req, res) => {
    // get user id from params
    // validate user id
    // find user in db
    // exclude password and refreshTokens
    // return res

    const { id } = req.params;

    const user = await User.findById(id).select("-password -refreshTokens");
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, user, "User fetched successfully"));
});

const updateUserRole = asyncHandler(async (req, res) => {
    // only admin can access this route (enforced in middleware)
    // get user id from params
    // get new role from body
    // validate role value
    // prevent admin from changing their own role
    // find and update user role in db
    // return res

    const { id } = req.params;
    const { role } = req.body;

    const allowedRoles = ["admin", "analyst", "viewer"];
    if (!role || !allowedRoles.includes(role)) {
        throw new ApiError(400, "Invalid role. Must be admin, analyst, or viewer");
    }

    if (req.user._id.toString() === id) {
        throw new ApiError(403, "Admin cannot change their own role");
    }

    const user = await User.findByIdAndUpdate(
        id,
        { role },
        { new: true }
    ).select("-password -refreshTokens");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, user, "User role updated successfully"));
});

const updateUserStatus = asyncHandler(async (req, res) => {
    // only admin can access this route (enforced in middleware)
    // get user id from params
    // get new status from body
    // validate status value
    // prevent admin from deactivating themselves
    // find and update user status in db
    // return res

    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["active", "inactive"];
    if (!status || !allowedStatuses.includes(status)) {
        throw new ApiError(400, "Invalid status. Must be active or inactive");
    }

    if (req.user._id.toString() === id) {
        throw new ApiError(403, "Admin cannot change their own status");
    }

    const user = await User.findByIdAndUpdate(
        id,
        { status },
        { new: true }
    ).select("-password -refreshTokens");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, user, "User status updated successfully"));
});

const deleteUser = asyncHandler(async (req, res) => {
    // only admin can access this route (enforced in middleware)
    // get user id from params
    // prevent admin from deleting themselves
    // find and delete user from db
    // return res

    const { id } = req.params;

    if (req.user._id.toString() === id) {
        throw new ApiError(403, "Admin cannot delete their own account");
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "User deleted successfully"));
});

export {
    getAllUsers,
    getUserById,
    updateUserRole,
    updateUserStatus,
    deleteUser,
};