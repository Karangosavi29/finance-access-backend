import jwt from "jsonwebtoken";
import { ApiError } from "../utils/Apierror.js";
import { User } from "../models/user.Model.js";

const verifyJWT = async (req, res, next) => {
    try {
        const token =
            req.cookies?.accessToken ||
            req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            return next(new ApiError(401, "Unauthorized request"));
        }

        let decodedToken;
        try {
            decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        } catch {
            return next(new ApiError(401, "Invalid or expired access token"));
        }

        const user = await User.findById(decodedToken._id).select(
            "-password -refreshTokens"
        );

        if (!user) {
            return next(new ApiError(401, "Invalid access token"));
        }

        if (user.status === "inactive") {
            return next(new ApiError(403, "Your account is inactive. Contact an admin"));
        }

        req.user = user;
        next();
    } catch (error) {
        next(error);
    }
};

const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user?.role)) {
            return next(new ApiError(
                403,
                `Role "${req.user?.role}" is not authorized to access this route`
            ));
        }
        next();
    };
};

export { verifyJWT, authorizeRoles };