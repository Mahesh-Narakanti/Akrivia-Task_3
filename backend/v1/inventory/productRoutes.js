const express = require("express");
const productController = require("./productController");
const router = express.Router();

// Routes for fetching products, categories, and vendors
router.get("/products", productController.getProducts);
router.get("/vendor", productController.getVendors);
router.get("/category", productController.getCategories);

// New routes for adding, deleting, and updating products
router.post("/addNew", productController.addNewProduct); // Add a new product
router.put("/del/:id", productController.deleteProduct); // Delete a product (soft delete)
router.put("/update", productController.updateProduct); // Update an existing product

module.exports = router;
