// routes/productRoutes.js
const express = require("express");
const {
  getAllProduct,
  getProductById,
  createProduct,
  deleteProduct,
  updateProduct,
  searchProduct,
} = require("../controller/product.controller");
const { verifyToken } = require("../middleware/verifyToken");


const router = express.Router();

// Log requests for debugging


// Search products (must come before /:id)
router.get("/search", searchProduct);

// Get all products
router.get("/allproducts", getAllProduct);

// Get product by ID (comes after /search)
router.get("/:id", getProductById);

// Create product
router.post("/postproduct",verifyToken, createProduct);

// Delete product
router.delete("/:productId",verifyToken, deleteProduct);

// Update product
router.put("/:productId",verifyToken, updateProduct);

module.exports = router;