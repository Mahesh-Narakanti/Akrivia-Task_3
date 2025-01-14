const { Model } = require("objection");
const product_to_vendor = require("./product-vendor"); // Import the junction model

class vendors extends Model {
  static get tableName() {
    return "vendors";
  }

  static get relationMappings() {
    return {
      product_vendor: {
        relation: Model.HasManyThroughRelation, // Use HasManyThroughRelation for many-to-many relationship
        modelClass: product_to_vendor,
        join: {
          from: "vendors.vendor_id",
          through: {
            from: "product_to_vendor.vendor_id",
            to: "product_to_vendor.product_id",
          },
          to: "products.product_id",
        },
      },
    };
  }
}

module.exports = vendors;
