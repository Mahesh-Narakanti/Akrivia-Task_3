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
      .leftJoin(
        "product_to_vendor",
        "products.product_id",
        "=",
        "product_to_vendor.product_id"
      )
      .leftJoin(
        "vendors",
        "product_to_vendor.vendor_id",
        "=",
        "vendors.vendor_id"
      )
      .select("products.*", "categories.category_name", "vendors.vendor_name")
      .whereNot("products.status", "99")
      .limit(20)
      .offset((page - 1) *10); // Apply the pagination offset

    // Fetch total count of products for pagination
    const totalProducts = await knex("products")
      .whereNot("status", "99")
      .count("product_id as count")
      .first();

    const totalPages = Math.floor(totalProducts.count / 20);

    // Group vendors by product_id
     const productsWithVendorsMap = {};

     // Populate the map with products and associated vendors
     products.forEach((product) => {
       const { vendor_name, ...productData } = product;

       // Check if the product is already in the map
       if (productsWithVendorsMap[productData.product_id]) {
         // Add vendor to the existing product's vendor list
         productsWithVendorsMap[productData.product_id].vendors.push({
           vendor_name,
         });
       } else {
         // Otherwise, create a new product entry with a vendors array
         productsWithVendorsMap[productData.product_id] = {
           ...productData,
           vendors: vendor_name ? [{ vendor_name }] : [],
         };
       }
     });

     // Convert the map to an array of products
     const productsWithVendors = Object.values(productsWithVendorsMap).slice(
       0,
       10
     );

    res.json({
      products:productsWithVendors,
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
