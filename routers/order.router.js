import { Router } from "express";
import {
  createOrder,
  getOrders,
  getOrderById,
} from "../controllers/order.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// create new order
router.post("/", verifyJWT, createOrder);

// get all orders
router.get("/", verifyJWT, getOrders);

// get one order by id
router.get("/:id", verifyJWT, getOrderById);

export default router;