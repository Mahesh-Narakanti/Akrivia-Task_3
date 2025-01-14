const knexConfig = require("../mysql/knexfile");
const jwt = require("jsonwebtoken");
const knex = require("knex")(knexConfig);
const express = require("express");
const router = express.Router();

//add new products 

router.post("/addNew", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  const {
    product_name,
    status,
    category_name,
    vendors,
    quantity_in_stock,
    unit_price,
      product_image,
    full_image
  } = req.body;

  console.log(status);
  try {
    // Step 1: Get the category_id from the category_name

    let curstatus = "1";
    if (status == 0) {
      curstatus = "0";
    }
    // Step 2: Insert the new product into the products table
    const [newProduct] = await knex("products").insert({
      product_name,
      status: curstatus,
      category_id: category_name, // Use the category_id obtained from the query
      quantity_in_stock,
      unit_price,
        product_image, // Path to the uploaded image
      full_image
    }); // Step 3: Associate the selected vendors with the product
    const [productId] = await knex.raw(
      "SELECT product_id FROM products WHERE product_name = ? ORDER BY product_id DESC LIMIT 1",
      [product_name]
    );
    console.log("Product ID Retrieved:", productId);
    if (vendors && vendors.length > 0) {
      // Prepare the vendor-product associations
      const vendorAssociations = vendors.map((vendorId) => ({
        product_id: productId[0].product_id,
        vendor_id: vendorId,
      }));

      // Insert the associations into the product_to_vendor table
      await knex("product_to_vendor").insert(vendorAssociations);
    }

    // Return the response with the new product's ID
    res.status(201).json({
      message: "Product added successfully",
      productId: newProduct.product_id,
    });
  } catch (err) {
    console.error("Error adding product:", err);
    res.status(500).send("Error adding product");
  }
});

// Express route to update product status to 99

router.put("/del/:id", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  const productId = req.params.id;

  try {
    // Update the product status to 99 (soft delete)
    await knex("products")
      .where("product_id", productId)
      .update({ status: "99", updated_at: knex.fn.now() });

    res.status(200).json({ message: "Product status updated to 99" });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).send("Error updating product status");
  }
});



//update products

router.put("/update", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  const {
    product_id, // Make sure productId exists in the request payload
    product_name,
    status,
    category_id,
    vendors,
    quantity_in_stock,
    unit_price,
  } = req.body;

  console.log("Status:", status);

  try {
    let curstatus = "1";
    if (status === 0) {
      curstatus = "0";
    }
    const productId = product_id;
    // Ensure productId is provided
    if (!productId) {
      return res.status(400).json({ error: "Product ID is required" });
    }

    // Step 2: Update the product in the products table
    const rowsUpdated = await knex("products")
      .where("product_id", productId)
      .update({
        product_name,
        status: curstatus,
        category_id,
        quantity_in_stock,
        unit_price,
      });

    if (rowsUpdated === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    console.log("Product updated:", rowsUpdated);

    // Step 3: Handle the vendor associations in the product_to_vendor table

    if (vendors && vendors.length > 0) {
      // First, delete the existing vendor associations for the product
      await knex("product_to_vendor").where("product_id", productId).del();

      // Prepare the vendor-product associations
      const vendorAssociations = vendors.map((vendorId) => ({
        product_id: productId,
        vendor_id: vendorId,
      }));

      // Insert the new vendor associations
      await knex("product_to_vendor").insert(vendorAssociations);
      console.log("Vendor associations updated:", vendorAssociations);
    }

    // Return the response with a success message
    res.status(200).json({
      message: "Product and vendor associations updated successfully",
      productId,
    });
  } catch (err) {
    console.error("Error updating product:", err);
    res.status(500).send("Error updating product");
  }
});

module.exports = router;