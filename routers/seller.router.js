import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    registerSeller,
    getMySellerProducts,
} from "../controllers/seller.controller.js";

const sellerRouter = Router();

// Register a seller account
sellerRouter.post("/register", registerSeller);

// Get products listed by the currently authenticated seller
sellerRouter.get("/products/me", verifyJWT, getMySellerProducts);

export default sellerRouter;