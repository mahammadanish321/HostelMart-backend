import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponce } from "../utils/ApiResponce.js";
import { Product } from "../models/product.model.js";
import { uploadOnCloudinary } from "../utils/cloudnary.js";

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const requireSeller = (req) => {
    if (!req.user?._id) {
        throw new ApiError(401, "User not authenticated");
    }

    if (req.user.role !== "seller") {
        throw new ApiError(403, "Only sellers can manage products");
    }
};

const validateProductId = (id) => {
    if (!mongoose.isValidObjectId(id)) {
        throw new ApiError(400, "Invalid product id");
    }
};

const uploadProductImages = async (files) => {
    const results = await Promise.all(files.map((file) => uploadOnCloudinary(file.path, "image")));
    const imageUrls = results.filter((result) => result?.url).map((result) => result.url);

    if (imageUrls.length !== files.length) {
        throw new ApiError(500, "One or more product images could not be uploaded");
    }

    return imageUrls;
};

const uploadProductVideo = async (file) => {
    if (!file) return undefined;

    const result = await uploadOnCloudinary(file.path, "video");
    if (!result?.secure_url || !Number.isFinite(result.duration)) {
        throw new ApiError(500, "Product video upload failed");
    }
    if (result.duration > 120) {
        throw new ApiError(400, "Product video cannot be longer than 2 minutes");
    }

    return { url: result.secure_url, duration: result.duration };
};

const getProductFilters = (query, includeSearch = false) => {
    const filters = {};

    if (includeSearch && typeof query.q === "string" && query.q.trim()) {
        const searchTerm = escapeRegex(query.q.trim());
        filters.$or = [
            { name: { $regex: searchTerm, $options: "i" } },
            { description: { $regex: searchTerm, $options: "i" } },
        ];
    }

    if (query.category && query.category !== "all") filters.category = query.category;
    if (query.listingType) filters.listingType = query.listingType;
    if (query.location) filters.location = { $regex: `^${escapeRegex(query.location.trim())}$`, $options: "i" };

    const minPrice = Number(query.minPrice);
    const maxPrice = Number(query.maxPrice);
    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
        filters.price = {};
        if (Number.isFinite(minPrice)) filters.price.$gte = minPrice;
        if (Number.isFinite(maxPrice)) filters.price.$lte = maxPrice;
    }

    return filters;
};

const findProducts = async (req, res, includeSearch = false) => {
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 50, 1), 100);
    const filters = getProductFilters(req.query, includeSearch);

    const [products, total] = await Promise.all([
        Product.find(filters)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate("createdBy", "fullName shopName avatar location role email"),
        Product.countDocuments(filters),
    ]);

    return res.status(200).json(
        new ApiResponce(200, {
            products,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        }, includeSearch ? "Products searched successfully" : "Products fetched successfully")
    );
};


//create product for the authenticated seller
export const createProduct = asyncHandler(async (req, res) => {
    requireSeller(req);

    const { name, description, price, originalPrice, category, quantity, location, condition, listingType } = req.body;
    const files = req.files?.productImages || [];
    const videoFile = req.files?.productVideo?.[0];

    if (!name || !name.trim()) {
        throw new ApiError(400, "Product name is required");
    }

    if (price === undefined || !Number.isFinite(Number(price)) || Number(price) < 0) {
        throw new ApiError(400, "A valid non-negative product price is required");
    }

    if (quantity !== undefined && (!Number.isFinite(Number(quantity)) || Number(quantity) < 0)) {
        throw new ApiError(400, "Quantity must be a non-negative number");
    }

    if (files.length === 0 && !videoFile) {
        throw new ApiError(400, "Upload at least one product image or a product video");
    }

    const productImages = await uploadProductImages(files);
    const productVideo = await uploadProductVideo(videoFile);
    const productQuantity = quantity === undefined ? 1 : Math.max(1, Number(quantity));
    const product = await Product.create({
        name: name.trim(),
        description: description?.trim() || "",
        price: Number(price),
        originalPrice: originalPrice ? Number(originalPrice) : undefined,
        category: category || "other",
        condition: condition || "Brand New",
        listingType: listingType || "sell",
        quantity: productQuantity,
        inStock: productQuantity > 0,
        productImages,
        ...(productVideo ? { productVideo } : {}),
        createdBy: req.user._id,
        location: location?.trim() || req.user.location || "Campus",
    });

    const populatedProduct = await Product.findById(product._id).populate(
        "createdBy",
        "fullName shopName avatar location role email"
    );

    return res.status(201).json(
        new ApiResponce(201, populatedProduct, "Product listed successfully")
    );
});


//get all products with optional category, location, price, and pagination filters
export const getAllProducts = asyncHandler(async (req, res) => {
    return findProducts(req, res);
});


//search products using the q query parameter
export const searchProducts = asyncHandler(async (req, res) => {
    if (!req.query.q || !String(req.query.q).trim()) {
        throw new ApiError(400, "Search query q is required");
    }

    return findProducts(req, res, true);
});


//get one product by id
export const getProductById = asyncHandler(async (req, res) => {
    validateProductId(req.params.id);

    const product = await Product.findById(req.params.id).populate("createdBy", "fullName shopName avatar location role email");
    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    return res.status(200).json(
        new ApiResponce(200, product, "Product fetched successfully")
    );
});


//update product details owned by the authenticated seller
export const updateProduct = asyncHandler(async (req, res) => {
    requireSeller(req);
    validateProductId(req.params.id);

    const { name, description, price, originalPrice, category, quantity, inStock, location, condition, listingType } = req.body;
    const updateFields = {};

    if (name !== undefined) updateFields.name = name.trim();
    if (description !== undefined) updateFields.description = description.trim();
    if (price !== undefined) updateFields.price = Number(price);
    if (originalPrice !== undefined) updateFields.originalPrice = Number(originalPrice);
    if (category !== undefined) updateFields.category = category;
    if (condition !== undefined) updateFields.condition = condition;
    if (listingType !== undefined) updateFields.listingType = listingType;
    if (quantity !== undefined) {
        updateFields.quantity = Number(quantity);
        updateFields.inStock = Number(quantity) > 0;
    }
    if (inStock !== undefined && quantity === undefined) updateFields.inStock = inStock === true || inStock === "true";
    if (location !== undefined) updateFields.location = location.trim();

    if (Object.keys(updateFields).length === 0) {
        throw new ApiError(400, "No product fields provided to update");
    }

    const product = await Product.findOneAndUpdate(
        { _id: req.params.id, createdBy: req.user._id },
        { $set: updateFields },
        { new: true, runValidators: true }
    ).populate("createdBy", "fullName shopName avatar location role email");

    if (!product) {
        throw new ApiError(404, "Product not found or you do not own it");
    }

    return res.status(200).json(
        new ApiResponce(200, product, "Product updated successfully")
    );
});


//delete product owned by the authenticated seller
export const deleteProduct = asyncHandler(async (req, res) => {
    requireSeller(req);
    validateProductId(req.params.id);

    const product = await Product.findOneAndDelete({
        _id: req.params.id,
        createdBy: req.user._id,
    });

    if (!product) {
        throw new ApiError(404, "Product not found or you do not own it");
    }

    return res.status(200).json(
        new ApiResponce(200, product, "Product deleted successfully")
    );
});


//replace product images with newly uploaded images
export const updateProductImages = asyncHandler(async (req, res) => {
    requireSeller(req);
    validateProductId(req.params.id);

    const files = req.files?.productImages || [];
    const videoFile = req.files?.productVideo?.[0];
    const removeProductVideo = req.body.removeProductVideo === "true";
    if (files.length === 0 && !videoFile && !removeProductVideo) {
        throw new ApiError(400, "Upload product media or set removeProductVideo to true");
    }

    const currentProduct = await Product.findOne({ _id: req.params.id, createdBy: req.user._id });
    if (!currentProduct) {
        throw new ApiError(404, "Product not found or you do not own it");
    }

    const update = {};
    if (files.length > 0) update.productImages = await uploadProductImages(files);
    if (videoFile) update.productVideo = await uploadProductVideo(videoFile);

    const resultingImages = update.productImages || currentProduct.productImages;
    const resultingVideo = videoFile ? update.productVideo : (removeProductVideo ? undefined : currentProduct.productVideo);
    if (resultingImages.length === 0 && !resultingVideo?.url) {
        throw new ApiError(400, "A product must have at least one image or video");
    }

    const updateOperation = {};
    if (Object.keys(update).length > 0) updateOperation.$set = update;
    if (removeProductVideo && !videoFile) updateOperation.$unset = { productVideo: 1 };

    const product = await Product.findByIdAndUpdate(
        currentProduct._id,
        updateOperation,
        { new: true, runValidators: true }
    );

    if (!product) {
        throw new ApiError(404, "Product not found or you do not own it");
    }

    return res.status(200).json(
        new ApiResponce(200, product, "Product media updated successfully")
    );
});
