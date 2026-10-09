import { Router } from "express";
import {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
} from "../controllers/wishlist.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// add product to wishlist
router.post("/:productId", verifyJWT, addToWishlist);

// get wishlist
router.get("/", verifyJWT, getWishlist);

// remove product from wishlist
router.delete("/:productId", verifyJWT, removeFromWishlist);

export default router;