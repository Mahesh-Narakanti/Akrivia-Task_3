const express = require("express");
const AWS = require("aws-sdk");
const sharp = require("sharp");
const s3Utils = require("../aws/s3Utils"); // Importing the S3 utility from the new location
const router = express.Router();

// Upload Route
router.post("/", async (req, res) => {
  try {
    // Binary data base64

    const fileContent = Buffer.from(req.files.uploadedFileName.data, "binary");

    // Upload the original image to S3
    const originalImageURL = await s3Utils.uploadToS3(
      fileContent,
      "profile-pics/" + req.files.uploadedFileName.name
    );

    // Create the thumbnail using sharp
    const thumbnailBuffer = await sharp(fileContent)
      .resize(50, 50) // Resize to 100x100 for the thumbnail
      .toBuffer();

    // Upload the thumbnail to S3
    const thumbnailURL = await s3Utils.uploadToS3(
      thumbnailBuffer,
      "thumbnails/" + req.files.uploadedFileName.name
    );

    // Send back URLs for both original and thumbnail
    res.json({
      profilePicUrl: originalImageURL,
      thumbnailUrl: thumbnailURL,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error uploading image");
  }
});


//import products

router.post("/import", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  const { productsData } = req.body; // The product data sent from the frontend

  try {
    // Step 1: Process Categories
    const categories = [];
    for (const product of productsData) {
      if (product.category_name) {
        categories.push(product.category_name);
      }
    }

    // Insert categories if they don't exist
    const insertedCategories = {};
    await Promise.all(
      categories.map(async (categoryName) => {
        if (!insertedCategories[categoryName]) {
          const existingCategory = await knex("categories")
            .where("category_name", categoryName)
            .first();

          if (existingCategory) {
            insertedCategories[categoryName] = existingCategory.category_id;
          } else {
            const [category] = await knex("categories").insert({
              category_name: categoryName,
              status: 1,
            });
            insertedCategories[categoryName] = category[0];
          }
        }
      })
    );

    // Step 2: Process Vendors
    const vendorNames = new Set(); // Use a Set to ensure no duplicates
    productsData.forEach((product) => {
      if (product.vendors && product.vendors.length > 0) {
        product.vendors.forEach((vendor) => {
          vendorNames.add(vendor.vendor_name);
        });
      }
    });

    // Insert vendors if they don't exist
    const insertedVendors = {};
    await Promise.all(
      [...vendorNames].map(async (vendorName) => {
        if (!insertedVendors[vendorName]) {
          const existingVendor = await knex("vendors")
            .where("vendor_name", vendorName)
            .first();

          if (existingVendor) {
            insertedVendors[vendorName] = existingVendor.vendor_id;
          } else {
            const [vendor] = await knex("vendors").insert({
              vendor_name: vendorName,
              status: 1,
            });
            insertedVendors[vendorName] = vendor[0];
          }
        }
      })
    );
    console.log(insertedCategories);
    console.log(insertedVendors);

    // Step 3: Insert Products
    const insertedProducts = [];
    await Promise.all(
      productsData.map(async (product) => {
        // Get the category_id for the current product
        const categoryId = insertedCategories[product.category_name];

        // Get the vendor_ids for the current product
        const vendorIds = product.vendors.map(
          (vendor) => insertedVendors[vendor.vendor_name]
        );

        // Insert the product into the "products" table
        const [insertedProduct] = await knex("products").insert({
          product_name: product.product_name,
          category_id: categoryId,
          quantity_in_stock: product.quantity_in_stock,
          unit_price: product.unit_price,
          product_image: product.product_image,
          status: "1", // Default status to active
        });
        console.log(vendorIds);
        const [productId] = await knex.raw(
          "SELECT product_id FROM products WHERE product_name = ? ORDER BY product_id DESC LIMIT 1",
          [product.product_name]
        );
        // Step 4: Associate Vendors with the Product
        await Promise.all(
          vendorIds.map(async (vendorId) => {
            await knex("product_to_vendor").insert({
              product_id: productId[0].product_id,
              vendor_id: vendorId,
              status: 1, // Default status to active
            });
          })
        );

        insertedProducts.push(insertedProduct);
      })
    );

    // Return a success response
    return res.status(200).json({
      message: "Products imported successfully.",
      data: insertedProducts, // Optionally return the inserted data
    });
  } catch (error) {
    console.error("Error processing file:", error);
    return res.status(500).json({ error: "Failed to import products." });
  }
});

module.exports = router;
