const knexConfig = require("../../mysql/knexfile"); // Assuming knexfile is in ../mysql/knexfile
const knex = require("knex")(knexConfig);
const productQuery = require("./productQuery");

module.exports = {
  // Group vendors by product_id
  groupVendorsByProduct: (products) => {
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

    return Object.values(productsWithVendorsMap);
  },
  // Fetch paginated products
  fetchPaginatedProducts: async (page, limit) => {
    const products = await productQuery.getPaginatedProducts(page, limit);
    const totalProducts = await productQuery.getTotalProductsCount();
    const totalPages = Math.ceil(totalProducts.count / limit);

    const productsWithVendors = module.exports.groupVendorsByProduct(products);

    return { products: productsWithVendors, totalPages, currentPage: page };
  },

  // Add a new product
  addNewProduct: async ({
    product_name,
    status,
    category_name,
    vendors,
    quantity_in_stock,
    unit_price,
    product_image,
    full_image,
  }) => {
    let curstatus = "active";
    if (status === 0) {
      curstatus = "default";
    }
    const isThere = await knex("products").where("product_name", product_name).andWhereNot("status","deleted").first();
    if (!isThere) {
      const [newProduct] = await knex("products").insert({
        product_name,
        status: curstatus,
        category_id: category_name,
        quantity_in_stock,
        unit_price,
        product_image,
        full_image,
      });

      const [productId] = await knex.raw(
        "SELECT product_id FROM products WHERE product_name = ? ORDER BY product_id DESC LIMIT 1",
        [product_name]
      );

      if (vendors && vendors.length > 0) {
        const vendorAssociations = vendors.map((vendorId) => ({
          product_id: productId[0].product_id,
          vendor_id: vendorId,
        }));

        await knex("product_to_vendor").insert(vendorAssociations);
      }
    

      return newProduct;
    }
    return null;
  },

  // Delete a product (soft delete)
  deleteProduct: async (productId) => {
    await knex("products")
      .where("product_id", productId)
      .update({ status: "deleted" });
  },

  // Update a product
  updateProduct: async ({
    product_id,
    product_name,
    status,
    category_id,
    vendors,
    quantity_in_stock,
    unit_price,
  }) => {
    let curstatus = "active";
    if (status === '0') {
      curstatus = "default";
    }
    else if (status === '2')
      curstatus = "inactive";

    await knex("products").where("product_id", product_id).update({
      product_name,
      status: curstatus,
      category_id,
      quantity_in_stock,
      unit_price,
    });

    if (vendors && vendors.length > 0) {
      await knex("product_to_vendor").where("product_id", product_id).del();

      const vendorAssociations = vendors.map((vendorId) => ({
        product_id: product_id,
        vendor_id: vendorId,
      }));

      await knex("product_to_vendor").insert(vendorAssociations);
    }

    return { product_id };
  },

  // Fetch vendors
  fetchVendors: async () => {
    return await productQuery.getVendors();
  },

  // Fetch categories
  fetchCategories: async () => {
    return await productQuery.getCategories();
  },
};
