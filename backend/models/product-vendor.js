const { Model } = require("objection");
const vendors = require("./vendors");
const products = require("./products");

class product_to_vendor extends Model {
  static get tableName() {
    return "product_to_vendor";
  }

  static get relationMappings() {
    return {
      vendor: {
        relation: Model.HasOneRelation,
        modelClass: vendors,
        join: {
          from: "product_to_vendor.vendor_id",
          to: "vendors.vendor_id",
        },
      },
      product: {
        relation: Model.HasOneRelation, // Change to HasOneRelation for linking a single product
        modelClass: products,
        join: {
          from: "product_to_vendor.product_id",
          to: "products.product_id",
        },
      },
    };
  }
}

module.exports = product_to_vendor;
