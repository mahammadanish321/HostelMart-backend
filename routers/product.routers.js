import { Router } from "express";
import {
  createProduct,
  getAllProducts,
  searchProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  updateProductImages,
} from "../controllers/product.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// get all products
router.get("/", getAllProducts);

// search products
router.get("/search", searchProducts);

// Create as an authenticated seller. Multipart fields: productImages (up to 8), productVideo (optional, max 2 minutes).
router.post("/", verifyJWT, upload.fields([
  { name: "productImages", maxCount: 8 },
  { name: "productVideo", maxCount: 1 },
]), createProduct);

// get single product
router.get("/:id", getProductById);

// update product
router.patch("/:id", verifyJWT, updateProduct);

// delete product
router.delete("/:id", verifyJWT, deleteProduct);

// update product images
router.patch("/:id/media", verifyJWT, upload.fields([
  { name: "productImages", maxCount: 8 },
  { name: "productVideo", maxCount: 1 },
]), updateProductImages);

export default router;