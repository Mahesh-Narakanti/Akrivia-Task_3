const productService = require("./productService");
const logger = require("../../logger");

module.exports = {
  // Fetch products with pagination
  getProducts: async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    try {
      const { products, totalPages, currentPage } =
        await productService.fetchPaginatedProducts(page, limit);
      res.json({ products, totalPages, currentPage });
    } catch (err) {
      logger.error(err);
      res.status(500).send("Error fetching products");
    }
  },

  // Fetch vendors
  getVendors: async (req, res) => {
    try {
      const vendors = await productService.fetchVendors();
      res.json(vendors);
    } catch (err) {
      logger.error(err);
      res.status(500).send("Error fetching vendors");
    }
  },

  // Fetch categories
  getCategories: async (req, res) => {
    try {
      const categories = await productService.fetchCategories();
      res.json(categories);
    } catch (err) {
      logger.error(err);
      res.status(500).send("Error fetching categories");
    }
  },

  // Add a new product
  addNewProduct: async (req, res) => {
    const {
      product_name,
      status,
      category_name,
      vendors,
      quantity_in_stock,
      unit_price,
      product_image,
      full_image,
    } = req.body;
    try {
      const newProduct = await productService.addNewProduct({
        product_name,
        status,
        category_name,
        vendors,
        quantity_in_stock,
        unit_price,
        product_image,
        full_image,
      });

      if (newProduct) {
        return res.status(201).json({
          message: "Product added successfully",
          productId: newProduct.product_id,
        });
      }
      return res.status(400).send("product already exist");
    } catch (err) {
      logger.error("Error adding product:", err);
      res.status(500).send("Error adding product");
    }
  },

  // Delete a product (soft delete)
  deleteProduct: async (req, res) => {
    const productId = req.params.id;
    try {
      await productService.deleteProduct(productId);
      res.status(200).json({ message: "Product status updated to 99" });
    } catch (err) {
      logger.error("Error deleting product:", err);
      res.status(500).send("Error updating product status");
    }
  },

  // Update a product
  updateProduct: async (req, res) => {
    const {
      product_id,
      product_name,
      status,
      category_id,
      vendors,
      quantity_in_stock,
      unit_price,
    } = req.body;
    try {
      const updatedProduct = await productService.updateProduct({
        product_id,
        product_name,
        status,
        category_id,
        vendors,
        quantity_in_stock,
        unit_price,
      });
      res.status(200).json({
        message: "Product and vendor associations updated successfully",
        productId: updatedProduct.product_id,
      });
    } catch (err) {
      logger.error("Error updating product:", err);
      res.status(500).send("Error updating product");
    }
  },
};
