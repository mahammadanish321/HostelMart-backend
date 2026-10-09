import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { Product } from "../models/product.model.js";
import { ApiResponce } from "../utils/ApiResponce.js";
import { generateAccessAndRefreshToken } from "./token.controller.js";



//register seller
export const registerSeller = asyncHandler(async (req, res) => {
  const { fullName, email, password, location, shopName } = req.body;

  if (!fullName || !fullName.trim()) {
    throw new ApiError(400, "Full name is required");
  }

  if (!email || !email.includes("@")) {
    throw new ApiError(400, "Valid email is required");
  }

  if (!password || password.length < 6 || password.length > 20) {
    throw new ApiError(400, "Password must be between 6 and 20 characters");
  }

  if (!location || !location.trim()) {
    throw new ApiError(400, "Location is required");
  }

  if (!shopName || !shopName.trim()) {
    throw new ApiError(400, "Shop name is required");
  }

  const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
  if (existingUser) {
    throw new ApiError(409, "User already exists");
  }

  const seller = await User.create({
    fullName,
    email: email.toLowerCase().trim(),
    password,
    location: location.trim(),
    role: "seller",
    shopName: shopName.trim(),
  });

  const createdSeller = await User.findById(seller._id).select("-password -refreshToken");

  if (!createdSeller) {
    throw new ApiError(500, "Something went wrong while creating seller");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(seller._id);

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
      new ApiResponce(201, { user: createdSeller, accessToken }, "Seller registered successfully")
    );
});


//get products listed by the authenticated seller
export const getMySellerProducts = asyncHandler(async (req, res) => {
  if (!req.user?._id) {
    throw new ApiError(401, "User not authenticated");
  }

  if (req.user.role !== "seller") {
    throw new ApiError(403, "Only sellers can view seller listings");
  }

  const products = await Product.find({ createdBy: req.user._id }).sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponce(200, products, "Seller products fetched successfully")
  );
});