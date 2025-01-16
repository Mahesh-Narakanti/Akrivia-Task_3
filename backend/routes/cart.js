const knexConfig = require("../mysql/knexfile");
const jwt = require("jsonwebtoken");
const knex = require("knex")(knexConfig);
const express = require("express");
const router = express.Router();


//add to cart

router.post("/add", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  try {
    // Log the request body for debugging
    console.log("Request Body:", req.body);

    // Extract the items from the request body
    const { itemsToSend } = req.body;
    console.log(itemsToSend);
    if (!itemsToSend || itemsToSend.length === 0) {
      return res.status(400).json({ message: "Invalid input data" });
    }

    // Token validation and decoding
    if (!token) {
      return res.status(403).send("Token Required");
    }

    const decoded = jwt.verify(token, "godisgreat");
    const user_id = decoded.id;

    if (!user_id) {
      return res.status(400).json({ message: "Invalid user" });
    }

    // Start a transaction
    const trx = await knex.transaction();

    try {
      // Mapping the cart items to insert into the database
      const itemsToInsert = itemsToSend.map((item) => ({
        id: user_id, // User ID from the decoded token
        product_name: item.product_name, // Product name from the cart item
        vendor_name: item.selected_vendor_name, // Vendor name from the cart item
        quantity: item.quantity, // Quantity of the product
        category: item.category_name, // Category name of the product
        product_image: item.product_image, // Product image URL
        created_at: new Date(), // Creation timestamp of the cart item
      }));

      // Insert multiple items at once into the cart table using the transaction
      await trx("cart").insert(itemsToInsert);

      // Update the product quantities in the products table
      for (let item of itemsToSend) {
        const updatedRows = await trx("products")
          .where("product_id", item.product_id) // Assuming product_name is unique
          .decrement("quantity_in_stock", item.quantity) // Decrease the quantity
          .where("quantity_in_stock", ">=", item.quantity); // Ensure there is enough quantity to decrement

        if (updatedRows === 0) {
          // If no rows were updated, it means there's insufficient stock
          throw new Error(
            `Not enough stock for ${item.product_name} (Vendor: ${item.selected_vendor_name})`
          );
        }
      }

      // Commit the transaction if everything is successful
      await trx.commit();

      // Send a success response
      return res.status(200).json({
        message: "Items added to cart successfully",
      });
    } catch (error) {
      // Rollback the transaction if anything goes wrong
      await trx.rollback();
      console.error("Error during transaction:", error);
      return res.status(500).json({
        message: "Error adding items to cart",
        error: error.message,
      });
    }
  } catch (error) {
    // Handle errors and provide a helpful message
    console.error("Error adding items to cart:", error);
    return res.status(500).json({
      message: "Error processing your request",
      error: error.message,
    });
  }
});


//get from cart

router.get("/get", async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];

  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(403).send("Token Required");
    }

    const decoded = jwt.verify(token, "godisgreat");
    const user_id = decoded.id;
    const cart = await knex("cart")
      .select("*") // Select all columns, or choose specific columns if needed
      .where("id", user_id);
    console.log(cart);
    res.json(cart);
  }
  catch (error) {
   console.error(error);
   res.status(500).send("Error fetching products");
  }
});

module.exports = router;