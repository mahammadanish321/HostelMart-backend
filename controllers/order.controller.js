import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponce } from "../utils/ApiResponce.js";
import { User } from "../models/user.model.js";
import { Product } from "../models/product.model.js";
import { Order } from "../models/order.model.js";

//place an order using the current user's cart and reserve product stock
export const createOrder = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).populate("cart.product");

    if (!user) throw new ApiError(404, "User not found");
    if (!user.cart || user.cart.length === 0) throw new ApiError(400, "Your cart is empty");

    const orderProducts = user.cart.map((item) => {
        const product = item.product;
        if (!product) throw new ApiError(404, "A cart product no longer exists");
        if (!Number.isInteger(item.quantity) || item.quantity < 1) {
            throw new ApiError(400, "Cart contains an invalid quantity");
        }
        if (product.quantity < item.quantity) {
            throw new ApiError(409, `${product.name} does not have enough stock`);
        }

        return {
            product: product._id,
            name: product.name,
            quantity: item.quantity,
            price: product.price,
        };
    });

    for (const item of orderProducts) {
        const product = user.cart.find((cartItem) => cartItem.product._id.equals(item.product)).product;
        const remainingQuantity = product.quantity - item.quantity;
        const stockUpdate = await Product.updateOne(
            { _id: item.product, quantity: { $gte: item.quantity } },
            {
                $inc: { quantity: -item.quantity },
                $set: { inStock: remainingQuantity > 0 },
            }
        );

        if (stockUpdate.matchedCount !== 1) {
            throw new ApiError(409, `${item.name} stock changed; please review your cart`);
        }
    }

    const totalAmount = orderProducts.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    );

    const [newOrder] = await Order.create([{
        user: user._id,
        products: orderProducts,
        totalAmount,
    }]);

    await User.updateOne({ _id: user._id }, { $set: { cart: [] } });

    const order = await Order.findById(newOrder._id).populate("products.product", "name productImages");
    return res.status(201).json(
        new ApiResponce(201, order, "Order placed successfully")
    );
});


//get orders belonging to the current user
export const getOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .populate("products.product", "name productImages");

    return res.status(200).json(
        new ApiResponce(200, orders, "Orders fetched successfully")
    );
});


//get one order belonging to the current user
export const getOrderById = asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        throw new ApiError(400, "Invalid order id");
    }

    const order = await Order.findOne({ _id: req.params.id, user: req.user._id })
        .populate("products.product", "name productImages");

    if (!order) throw new ApiError(404, "Order not found");

    return res.status(200).json(
        new ApiResponce(200, order, "Order fetched successfully")
    );
});
