const cartService = require("./cartService"); // Relative import
const logger=require("../../logger")

module.exports = {
  // Add to cart route controller
  addToCart: async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];

    try {
      // Extract the items from the request body
      const { itemsToSend } = req.body;
      if (!itemsToSend || itemsToSend.length === 0) {
        return res.status(400).json({ message: "Invalid input data" });
      }

      if (!token) {
        return res.status(403).send("Token Required");
      }

      const { user_id, role } = await cartService.verifyTokenAndGetUserId(token);
      if (!user_id) {
        return res.status(400).json({ message: "Invalid user" });
      }
      
      // Proceed with adding items to cart
      await cartService.addItemsToCart(user_id, itemsToSend);
      res.status(200).json({ message: "Items added to cart successfully" });
    } catch (error) {
      logger.error(error);
      res.status(500).json({
        message: "Error processing your request",
        error: error.message,
      });
    }
  },

  // Get cart items route controller
  getCart: async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(403).send("Token Required");
    }

    try {
      const { user_id, role } = await cartService.verifyTokenAndGetUserId(token);
      const cartItems = await cartService.getCartItems(user_id,role);
      res.json(cartItems);
    } catch (error) {
      logger.error(error);
      console.log(error);
      res.status(500).send("Error fetching products");
    }
  },

   deleteItem: async (req, res) => {
      const cart_id = req.params.cart_id;
      try {
        await cartService.deleteItem(cart_id);
        res.status(200).json({ message: "Product status updated to 99" });
      } catch (err) {
        logger.error("Error deleting product:", err);
        res.status(500).send("Error updating product status");
      }
    },

  adjustQuantity: async (req, res) => {
     const { user_id, cart_id, product_name, amount } = req.body;

     try {
       // Validate input
       if (typeof amount !== "number" || amount === 0) {
         return res.status(400).json({ message: "Invalid amount" });
       }

       // Call the service function to adjust quantities
       const result = await cartService.adjustQuantityInCart(
         user_id,
         cart_id,
         product_name,
         amount
       );

       // Respond with the updated data
       return res.status(200).json({
         message: "Quantity adjusted successfully",
         newCartQuantity: result.newCartQuantity,
         newProductStock: result.newProductStock,
       });
     } catch (error) {
       console.error("Error adjusting quantity:", error);
       return res
         .status(500)
         .json({ message: "Error adjusting quantity", error: error.message });
     }
   }
  
};
