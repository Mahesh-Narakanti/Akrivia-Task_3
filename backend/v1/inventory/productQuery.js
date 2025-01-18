const knexConfig = require("../../mysql/knexfile"); // Assuming knexfile is in ../mysql/knexfile
const knex = require("knex")(knexConfig);

module.exports = {
  // Get paginated products
  getPaginatedProducts: async (page, limit) => {
    return    await knex("products")
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
      .offset((page - 1) * limit); 
  },

  // Get total product count for pagination
  getTotalProductsCount: async () => {
    return await knex("products")
      .whereNot("status", "99")
      .count("product_id as count")
      .first();
  },

  // Get vendors
  getVendors: async () => {
    return await knex("vendors").select("*");
  },

  // Get categories
  getCategories: async () => {
    return await knex("categories").select("*");
  },
};
