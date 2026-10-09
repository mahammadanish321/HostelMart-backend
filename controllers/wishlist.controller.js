import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponce } from "../utils/ApiResponce.js";
import { User } from "../models/user.model.js";
import { Product } from "../models/product.model.js";

const validateProductId = (productId) => {
    if (!mongoose.isValidObjectId(productId)) {
        throw new ApiError(400, "Invalid product id");
    }
};

//add a product to the current user's wishlist
export const addToWishlist = asyncHandler(async (req, res) => {
    validateProductId(req.params.productId);

    const product = await Product.findById(req.params.productId);
    if (!product) throw new ApiError(404, "Product not found");

    const user = await User.findByIdAndUpdate(
        req.user._id,
        { $addToSet: { likedProducts: req.params.productId } },
        { new: true }
    ).populate("likedProducts");

    if (!user) throw new ApiError(404, "User not found");

    return res.status(200).json(
        new ApiResponce(200, user.likedProducts, "Product added to wishlist")
    );
});


//get the current user's wishlist
export const getWishlist = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).populate("likedProducts");
    if (!user) throw new ApiError(404, "User not found");

    return res.status(200).json(
        new ApiResponce(200, user.likedProducts, "Wishlist fetched successfully")
    );
});


//remove a product from the current user's wishlist
export const removeFromWishlist = asyncHandler(async (req, res) => {
    validateProductId(req.params.productId);

    const user = await User.findByIdAndUpdate(
        req.user._id,
        { $pull: { likedProducts: req.params.productId } },
        { new: true }
    ).populate("likedProducts");

    if (!user) throw new ApiError(404, "User not found");

    return res.status(200).json(
        new ApiResponce(200, user.likedProducts, "Product removed from wishlist")
    );
});
