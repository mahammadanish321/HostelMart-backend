import { Router } from "express";
import {
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
} from "../controllers/cart.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// add product to cart
router.post("/", verifyJWT, addToCart);

// get cart
router.get("/", verifyJWT, getCart);

// update cart item quantity
router.put("/:productId", verifyJWT, updateCartItem);

// remove product from cart
router.delete("/:productId", verifyJWT, removeFromCart);

export default router;