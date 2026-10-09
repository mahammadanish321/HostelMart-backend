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

const readQuantity = (value, defaultValue = 1) => {
    const quantity = value === undefined ? defaultValue : Number(value);
    if (!Number.isInteger(quantity) || quantity < 1) {
        throw new ApiError(400, "Quantity must be a positive whole number");
    }
    return quantity;
};

//add a product to the current user's cart (re-adding increments its quantity)
export const addToCart = asyncHandler(async (req, res) => {
    const { productId } = req.body;
    validateProductId(productId);
    const quantity = readQuantity(req.body.quantity);

    const [user, product] = await Promise.all([
        User.findById(req.user._id),
        Product.findById(productId),
    ]);

    if (!user) throw new ApiError(404, "User not found");
    if (!product) throw new ApiError(404, "Product not found");
    if (product.quantity < quantity) throw new ApiError(409, "Requested quantity is not in stock");

    const cartItem = user.cart.find((item) => item.product.toString() === productId);
    const nextQuantity = (cartItem?.quantity || 0) + quantity;
    if (nextQuantity > product.quantity) {
        throw new ApiError(409, "Requested quantity exceeds available stock");
    }

    if (cartItem) cartItem.quantity = nextQuantity;
    else user.cart.push({ product: productId, quantity });

    await user.save();
    const updatedUser = await User.findById(user._id).populate("cart.product");

    return res.status(200).json(
        new ApiResponce(200, updatedUser.cart, "Product added to cart")
    );
});


//get the current user's cart
export const getCart = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).populate("cart.product");
    if (!user) throw new ApiError(404, "User not found");

    return res.status(200).json(
        new ApiResponce(200, user.cart, "Cart fetched successfully")
    );
});


//set a cart item's quantity
export const updateCartItem = asyncHandler(async (req, res) => {
    validateProductId(req.params.productId);
    const quantity = readQuantity(req.body.quantity, 0);
    const [user, product] = await Promise.all([
        User.findById(req.user._id),
        Product.findById(req.params.productId),
    ]);

    if (!user) throw new ApiError(404, "User not found");
    if (!product) throw new ApiError(404, "Product not found");
    if (quantity > product.quantity) throw new ApiError(409, "Requested quantity exceeds available stock");

    const cartItem = user.cart.find((item) => item.product.toString() === req.params.productId);
    if (!cartItem) throw new ApiError(404, "Product is not in your cart");

    cartItem.quantity = quantity;
    await user.save();
    const updatedUser = await User.findById(user._id).populate("cart.product");

    return res.status(200).json(
        new ApiResponce(200, updatedUser.cart, "Cart quantity updated")
    );
});


//remove a product from the current user's cart
export const removeFromCart = asyncHandler(async (req, res) => {
    validateProductId(req.params.productId);
    const user = await User.findById(req.user._id);
    if (!user) throw new ApiError(404, "User not found");

    const cartLength = user.cart.length;
    user.cart = user.cart.filter((item) => item.product.toString() !== req.params.productId);
    if (user.cart.length === cartLength) throw new ApiError(404, "Product is not in your cart");

    await user.save();
    const updatedUser = await User.findById(user._id).populate("cart.product");

    return res.status(200).json(
        new ApiResponce(200, updatedUser.cart, "Product removed from cart")
    );
});
