const knexConfig = require("../mysql/knexfile");
const jwt = require("jsonwebtoken");
const knex = require("knex")(knexConfig);
const express = require("express");
const router = express.Router();


router.get("/products", async (req, res) => {
  console.log("getting products");
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const searchQuery = req.query.search || "";
  const selectedColumns = req.query.filterColumns
    ? req.query.filterColumns.split(",")
    : null;
  const branch_id = req.query.branchId;
  console.log(branch_id);
  // Default columns if none are selected
  const defaultFilterColumns = [
    "product_name",
    "category_name",
    "vendors",
    "status",
    "quantity_in_stock",
    "unit_price",
  ];

  // If selectedColumns is null, add default columns
  const filterColumns =
    selectedColumns && selectedColumns.length > 0
      ? selectedColumns
      : defaultFilterColumns;

  try {
    // Step 1: Initial Query to Get Products and Related Data (Categories and Vendors)
    let query = knex("products")
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
      .whereNot("products.status", "deleted")
      .andWhere("products.branch_id", branch_id);
    
    // Step 2: Search based on selected filter columns
    if (searchQuery) {
      const search = searchQuery.toLowerCase();
      const matchConditions = [];

      // If no selected columns, apply search on all filter columns
      if (filterColumns.includes("product_name")) {
        matchConditions.push(
          knex.raw("LOWER(products.product_name) LIKE ?", [`%${search}%`])
        );
      }
      if (filterColumns.includes("category_name")) {
        matchConditions.push(
          knex.raw("LOWER(categories.category_name) LIKE ?", [`%${search}%`])
        );
      }
      if (filterColumns.includes("vendors")) {
        matchConditions.push(
          knex.raw("LOWER(vendors.vendor_name) LIKE ?", [`%${search}%`])
        );
      }
      if (filterColumns.includes("status")) {
        matchConditions.push(
          knex.raw("LOWER(products.status) LIKE ?", [`%${search}%`])
        );
      }
      if (filterColumns.includes("quantity_in_stock")) {
        matchConditions.push(
          knex.raw("LOWER(products.quantity_in_stock) LIKE ?", [`%${search}%`])
        );
      }
      if (filterColumns.includes("unit_price")) {
        matchConditions.push(
          knex.raw("LOWER(products.unit_price) LIKE ?", [`%${search}%`])
        );
      }

      if (matchConditions.length > 0) {
        query = query.where(function () {
          matchConditions.forEach((cond) => {
            this.orWhereRaw(cond);
          });
        });
      }
    }

    // Step 3: Get matching product IDs based on the search query
    const productIds = await query.select("products.product_id");

    // If no products match the search, return empty result
    if (productIds.length === 0) {
      return res.json({
        products: [],
        totalPages: 0,
        currentPage: page,
      });
    }

    // Step 4: Fetch the detailed product information for matching product IDs
    let detailedQuery = knex("products")
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
      .whereIn(
        "products.product_id",
        productIds.map((product) => product.product_id)
      );

    // Step 5: Apply pagination
    // const totalProducts = productIds.length;
    // const totalPages = Math.ceil(totalProducts / limit);
    // detailedQuery = detailedQuery.limit(limit).offset((page - 1) * limit);

    // Step 6: Fetch the final list of products with vendors and category details
    const products = await detailedQuery;

    // Step 7: Fetch vendors for each product
    const productIdsForVendors = products.map((product) => product.product_id);
    const vendors = await knex("product_to_vendor")
      .join("vendors", "product_to_vendor.vendor_id", "=", "vendors.vendor_id")
      .whereIn("product_to_vendor.product_id", productIdsForVendors)
      .select("product_to_vendor.product_id", "vendors.vendor_name");

    // Step 8: Map the vendors to their corresponding products
    const productsWithVendorsMap = {};

    products.forEach((product) => {
      const { vendor_name, ...productData } = product;

      if (productsWithVendorsMap[productData.product_id]) {
        productsWithVendorsMap[productData.product_id].vendors.push({
          vendor_name,
        });
      } else {
        productsWithVendorsMap[productData.product_id] = {
          ...productData,
          vendors: vendor_name ? [{ vendor_name }] : [],
        };
      }
    });
    const totalProducts = Object.keys(productsWithVendorsMap).length; // Correct length calculation
    const totalPages = Math.ceil(totalProducts / limit);

    let productsWithVendors = Object.values(productsWithVendorsMap).sort(
      (a, b) => a.product_name.localeCompare(b.product_name)
    );
    // Step 3: Apply pagination (manual limit and offset)
    productsWithVendors =productsWithVendors.slice(
      (page - 1) * limit,
      page * limit
    ); // Manually paginate the array

    // Step 9: Return the paginated and detailed product list
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
