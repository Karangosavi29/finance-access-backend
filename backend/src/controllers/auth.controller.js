import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/Apierror.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import { User } from "../models/user.Model.js";

const generateAccessAndRefreshToken = async (userId) => {
    // find user
    // generate both tokens
    // save refresh token to db
    // return tokens
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshTokens.push(refreshToken);
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
};

const registerUser = asyncHandler(async (req, res) => {
    // get user details from request body
    // validation - empty fields
    // validate email format
    // check if user already exists
    // create user in db
    // remove password and refreshTokens from response
    // check for user creation
    // return res

    const { name, email, password, role } = req.body;

    if ([name, email, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    if (!email.includes("@")) {
        throw new ApiError(400, "Invalid email address");
    }

    const existedUser = await User.findOne({ email });
    if (existedUser) {
        throw new ApiError(409, "User already exists with this email");
    }

    const user = await User.create({
        name: name.toLowerCase(),
        email,
        password,
        role: role || "viewer",
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshTokens"
    );

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    return res
        .status(201)
        .json(new ApiResponse(201, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
    // get email and password from request body
    // validation - empty fields
    // find user by email
    // check if user is active
    // verify password
    // generate access and refresh tokens
    // send tokens in cookies
    // return res

    const { email, password } = req.body;

    if ([email, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "Email and password are required");
    }

    const user = await User.findOne({ email });
    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    if (user.status === "inactive") {
        throw new ApiError(403, "Your account is inactive. Contact an admin");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshTokens"
    );

    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(
            new ApiResponse(
                200,
                { user: loggedInUser, accessToken, refreshToken },
                "User logged in successfully"
            )
        );
});

const logoutUser = asyncHandler(async (req, res) => {
    // get refresh token from cookies
    // remove that refresh token from db
    // clear cookies
    // return res

    const incomingRefreshToken = req.cookies?.refreshToken;

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $pull: { refreshTokens: incomingRefreshToken },
        },
        { new: true }
    );

    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
    };

    return res
        .status(200)
        .clearCookie("accessToken", cookieOptions)
        .clearCookie("refreshToken", cookieOptions)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    // get refresh token from cookies or body
    // verify refresh token
    // find user by id from token payload
    // check if refresh token exists in user's db list
    // generate new access and refresh tokens
    // replace old refresh token in db
    // send new tokens in cookies
    // return res

    const incomingRefreshToken =
        req.cookies?.refreshToken || req.body?.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request");
    }

    let decodedToken;
    try {
        decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );
    } catch {
        throw new ApiError(401, "Invalid or expired refresh token");
    }

    const user = await User.findById(decodedToken._id);
    if (!user) {
        throw new ApiError(401, "Invalid refresh token");
    }

    if (!user.refreshTokens.includes(incomingRefreshToken)) {
        throw new ApiError(401, "Refresh token is expired or already used");
    }

    // rotate refresh token
    user.refreshTokens = user.refreshTokens.filter(
        (t) => t !== incomingRefreshToken
    );
    await user.save({ validateBeforeSave: false });

    const { accessToken, refreshToken: newRefreshToken } =
        await generateAccessAndRefreshToken(user._id);

    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", newRefreshToken, cookieOptions)
        .json(
            new ApiResponse(
                200,
                { accessToken, refreshToken: newRefreshToken },
                "Access token refreshed successfully"
            )
        );
});

export { registerUser, loginUser, logoutUser, refreshAccessToken };