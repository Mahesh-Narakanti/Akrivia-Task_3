const knexConfig = require("../mysql/knexfile");
const jwt = require("jsonwebtoken");
const knex = require("knex")(knexConfig);
const express = require("express");
const router = express.Router();


router.get("/products", async (req, res) => {
  const page = parseInt(req.query.page) || 1; // Default to page 1 if no page query
  const limit = parseInt(req.query.limit) || 10; // Default to 10 products per page
    const token = req.headers.authorization?.split(" ")[1];

  try {
    // Fetch products with pagination
    const products = await knex("products")
      .join("categories", "products.category_id", "=", "categories.category_id")
      .leftJoin("product_to_vendor", "products.product_id", "=", "product_to_vendor.product_id")
      .leftJoin("vendors", "product_to_vendor.vendor_id", "=", "vendors.vendor_id")
      .select("products.*", "categories.category_name", "vendors.vendor_name")
      .whereNot("products.status", "99")
      .limit(limit)
      .offset((page - 1) * limit); // Apply the pagination offset

    // Fetch total count of products for pagination
    const totalProducts = await knex("products")
      .whereNot("status", "99")
      .count("product_id as count")
      .first();

    const totalPages = Math.ceil(totalProducts.count / limit);

    // Reduce the products and group vendors
    const productsWithVendors = products.reduce((acc, product) => {
      const { vendor_name, ...productData } = product;
      const existingProduct = acc.find(item => item.product_id === productData.product_id);
      if (existingProduct) {
        existingProduct.vendors.push({ vendor_name });
      } else {
        acc.push({
          ...productData,
          vendors: [{ vendor_name }]
        });
      }
      return acc;
    }, []);

    res.json({
      products: productsWithVendors,
      totalPages,
      currentPage: page,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching products");
  }
});


router.get("/vendor", async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];

  try {
    const vendors = await knex("vendors").select("*");

    res.json(vendors);
  }
  catch (err)
  {
    console.error(err);
    res.status(500).send("Error fetching vendors");
  }
});

router.get("/category", async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];

  try {
    const category = await knex("categories").select("*");
    res.json(category);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching categories");
  }
});




module.exports = router;
