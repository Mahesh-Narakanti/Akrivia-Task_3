const knexConfig = require("../../mysql/knexfile"); // Assuming knexfile is in ../mysql/knexfile
const knex = require("knex")(knexConfig);

module.exports = {
  // Insert multiple items into the cart
  insertCartItems: async (items) => {
    return knex("cart").insert(items);
  },

  // Get cart items for a specific user
  getCartItems: (user_id) => {
    return knex("cart").select("*").where("id", user_id);
  },

  // Decrease product quantity in stock
  decrementProductQuantity: (product_id, quantity) => {
    return knex("products")
      .where("product_id", product_id)
      .decrement("quantity_in_stock", quantity)
      .where("quantity_in_stock", ">=", quantity);
  },
};
