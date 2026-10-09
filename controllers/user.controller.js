import { asyncHandler } from '../utils/asyncHandler.js'; //importing asyncHandler utility function to handle asynchronous operations in route handlers 
import { ApiError } from '../utils/ApiError.js'; //importing ApiError class for consistent API error handling
import { User } from '../models/user.model.js'; //importing User model to interact with user data in the database
// import { uploadOnCloudinary } from '../utils/cloudnary.js'; //importing uploadOnCloudinary function to handle file uploads to Cloudinary
import { ApiResponce } from '../utils/ApiResponce.js'; //importing ApiResponce class for standardized API responses
import jwt from "jsonwebtoken";  //importing for verifin token
import { generateAccessAndRefreshToken, refreshAccessToken } from './token.controller.js';







//register user
export const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, password, location, role } = req.body;
    // console.log(`name ${fullName},email ${email},password ${password}`);


    if (!fullName || !fullName.trim()) {
        throw new ApiError(400, "Full name is required");
    }

    if (!email || !email.includes("@")) {
        throw new ApiError(400, "Valid email is required");
    }

    if (!password || password.length < 6 || password.length > 20) {
        throw new ApiError(400, "Password must be between 6 and 20 characters");
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });

    if (existingUser) {
        throw new ApiError(409, "User already exists");
    }

    const user = await User.create({
        fullName,
        email: email.toLowerCase().trim(),
        password,
        location,
        role: "buyer"
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    const option = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        path: "/",
    };

    return res.status(201)
        .cookie("accessToken", accessToken, option)
        .cookie("refreshToken", refreshToken, option)
        .json(
            new ApiResponce(201, { user: createdUser, accessToken }, "User registered successfully")
        );
});



//login user
export const loginUser = asyncHandler(async (req, res) => {

    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, "Email and password are required");
    }

    const user = await User.findOne({
        email: email.toLowerCase().trim(),
    }).select("+password");

    if (!user) {
        throw new ApiError(400, "User not found")
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const option = {
        httpOnly: true, //only modyfi by server
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        path: "/",
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, option)
        .cookie("refreshToken", refreshToken, option)
        .json(
            new ApiResponce(
                200, {
                user: loggedInUser, accessToken,
            }, "Uer login succesfull"
            )
        );
})



//logout user
export const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, {
        $set: {
            refreshToken: undefined
        }
    }, { new: true })

    const option = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        path: "/",
    }

    return res.status(200)
        .clearCookie("accessToken", option)
        .clearCookie("refreshToken", option)
        .json(
            new ApiResponce(200, {}, "User logged out successfully")
        )


});



//change passowrd 
export const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body

    console.log("SEE HEAR YOUR OLD_PASSWORD AND NEW_PASSWORD", oldPassword, newPassword);

    if (!oldPassword || !newPassword) {
        throw new ApiError(400, "oldPassword and newPassword are required");
    }

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password")
    }

    user.password = newPassword
    await user.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(new ApiResponce(200, {}, "Password changed successfully"))
})


//getcurrent user
export const getCurrentUesr = asyncHandler(async (req, res) => {

    const user = await User.findById(req.user?._id)

    return res.status(200)
        .json(new ApiResponce(200, user, "User Fletch succecfully "))
})


//update userdetels
export const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email, description } = req.body;

    if (!req.user?._id) {
        throw new ApiError(401, "User not authenticated");
    }

    const updateFields = {};

    if (fullName && fullName.trim()) {
        updateFields.fullName = fullName.trim();
    }

    if (email && email.trim()) {
        updateFields.email = email.trim().toLowerCase();
    }
    if (email) {
        const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
        if (existingUser && existingUser._id.toString() !== req.user._id.toString()) {
            throw new ApiError(409, "Email already in use");
        }
    }

    if (description !== undefined) {
        updateFields.description = description.trim();
    }

    if (Object.keys(updateFields).length === 0) {
        throw new ApiError(400, "No valid fields provided");
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: updateFields },
        { new: true }
    ).select("-password -refreshToken");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json(
        new ApiResponce(200, user, "Account details updated successfully")
    );
});


//add and update avtar
export const updateUserAvatar = asyncHandler(async (req, res) => {
    if (!req.user?._id) {
        throw new ApiError(401, "User not authenticated");
    }

    let avatarUrl = req.body.avatar;

    if (req.file?.path) {
        const uploadedAvatar = await uploadOnCloudinary(req.file.path);

        if (!uploadedAvatar?.url) {
            throw new ApiError(500, "Failed to upload avatar");
        }

        avatarUrl = uploadedAvatar.url;
    }

    if (!avatarUrl || !avatarUrl.trim()) {
        throw new ApiError(400, "Avatar is required");
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: { avatar: avatarUrl.trim() } },
        { new: true }
    ).select("-password -refreshToken");

    return res.status(200).json(
        new ApiResponce(200, user, "Avatar updated successfully")
    );
});