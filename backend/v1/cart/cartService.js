const jwt = require("jsonwebtoken");
const cartQuery = require("./cartQuery"); // Relative import
const knexConfig = require("../../mysql/knexfile"); // Assuming knexfile is in ../mysql/knexfile
const { adjustQuantity } = require("./cartController");
const knex = require("knex")(knexConfig);

module.exports = {
  // Verify token and get user ID
  verifyTokenAndGetUserId: async (token) => {
    try {
      const decoded = jwt.verify(token, "godisgreat");
      return {
        user_id: decoded.id,
        role: decoded.role
      };
    } catch (error) {
      throw new Error("Invalid token");
    }
  },

  // Add items to cart and update stock in products table
  addItemsToCart: async (user_id, itemsToSend) => {
    // Start a transaction

    //console.log(user_id);
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
      await trx.transaction(async (trx) => {
        for (const item of itemsToInsert) {
          const existingCartItem = await trx("cart")
            .where({
              product_name: item.product_name,
              id: item.id,
              vendor_name: item.vendor_name,
            })
            .whereNot("status","99")
            .first(); // Fetch the first matching row, if any

          if (existingCartItem) {
            // If the item exists, update the quantity by adding the new quantity to the existing one
            await trx("cart")
              .where({
                product_name: item.product_name,
                id: item.id,
                vendor_name: item.vendor_name,
              })
              .update({
                quantity: trx.raw("quantity + ?", [item.quantity]),
              });
          } else {
            // If no matching row exists, insert the new item
            await trx("cart").insert(item);
          }
        }
      });

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
  getCartItems: async (user_id, role) => {
      const products = await knex("products")
        .select("product_name")
        .where("status", "deleted");
    // console.log(products);
    const productNames =  products.map((product) => product.product_name);

    // console.log(productNames);
    console.log("in cart "+ role);

      return knex("cart")
        .select("*")
        .where("id", user_id)
        .andWhereNot("status", "99")
        .whereNotIn("product_name", productNames);
  },

  deleteItem: async (cart_id) => {
    await knex("cart")
      .where("cart_id", cart_id)
      .update({ status: '99' });
    const cart = await knex("cart").select("quantity", "product_name").where("cart_id", cart_id).first();
    const product = await knex("products").select("quantity_in_stock").where("product_name", cart.product_name).first();

    await knex("products").where("product_name", cart.product_name).update("quantity_in_stock", cart.quantity + product.quantity_in_stock);
  },

  adjustQuantityInCart: async (id, cart_id, product_name, amount)=> {
    const trx = await knex.transaction();

    try {
      // Step 1: Get the current cart item
      const cartItem = await trx('cart')
        .where("cart_id",cart_id)
        .first();

      if (!cartItem) {
        throw new Error('Cart item not found');
      }

      // Step 2: Adjust the quantity in the cart
      let newQuantity = cartItem.quantity + amount;
      if (newQuantity < 1) newQuantity = 0;  // Ensure quantity doesn't go below 0

      await trx('cart')
        .where("cart_id", cart_id )
        .update({ quantity: newQuantity });

      // Step 3: Adjust the product quantity in the product table
      const product = await trx('products')
        .where("product_name", product_name)
        .first();

      if (!product) {
        throw new Error('Product not found');
      }

      let newProductQuantity = product.quantity_in_stock - amount;
      if (newProductQuantity < 0) {
        throw new Error('Not enough stock');
      }

      await trx('products')
        .where("product_id", product.product_id )
        .update({ quantity_in_stock: newProductQuantity });

      // Step 4: Commit the transaction
      await trx.commit();

      return { newCartQuantity: newQuantity, newProductStock: newProductQuantity };
    } catch (error) {
      await trx.rollback();
      throw error;  // Re-throw error to be handled in the controller
    }
  }
};
