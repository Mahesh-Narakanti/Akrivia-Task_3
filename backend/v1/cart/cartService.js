const jwt = require("jsonwebtoken");
const cartQuery = require("./cartQuery"); // Relative import
const knexConfig = require("../../mysql/knexfile"); // Assuming knexfile is in ../mysql/knexfile
const knex = require("knex")(knexConfig);

module.exports = {
  // Verify token and get user ID
  verifyTokenAndGetUserId: async (token) => {
    try {
      const decoded = jwt.verify(token, "godisgreat");
      return decoded.id;
    } catch (error) {
      throw new Error("Invalid token");
    }
  },

  // Add items to cart and update stock in products table
  addItemsToCart: async (user_id, itemsToSend) => {
    // Start a transaction
    const trx = await knex.transaction();

    try {
      // Insert cart items
      const itemsToInsert = itemsToSend.map((item) => ({
        id: user_id,
        product_name: item.product_name,
        vendor_name: item.selected_vendor_name,
        quantity: item.quantity,
        category: item.category_name,
        product_image: item.product_image,
      }));

      await trx("cart").insert(itemsToInsert);

      // Update product quantities in products table
      for (let item of itemsToSend) {
        const updatedRows = await trx("products")
          .where("product_id", item.product_id)
          .decrement("quantity_in_stock", item.quantity)
          .where("quantity_in_stock", ">=", item.quantity);

        if (updatedRows === 0) {
          throw new Error(
            `Not enough stock for ${item.product_name} (Vendor: ${item.selected_vendor_name})`
          );
        }
      }

      // Commit transaction if everything is successful
      await trx.commit();
    } catch (error) {
      // Rollback transaction if anything fails
      await trx.rollback();
      throw error; // Propagate error to be handled by controller
    }
  },

  // Get cart items from database
  getCartItems: async (user_id) => {
    return knex("cart")
      .select("*")
      .where("id", user_id)
      .andWhereNot("status", "99");
  },

  deleteItem: async (cart_id) => {
    await knex("cart")
      .where("cart_id", cart_id)
      .update({ status: '99' });
  },
};
