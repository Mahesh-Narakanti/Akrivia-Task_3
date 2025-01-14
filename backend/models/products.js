const { Model } = require("objection");
const categories = require("./categories");
const product_to_vendor = require("./product-vendor");

class products extends Model {
  static get tableName() {
    return "products";
  }

  static get relationMappings() {
    return {
      category: {
        relation: Model.HasManyRelation,
        modelClass: categories,
        join: {
          from: "products.category_id",
          to: "categories.category_id",
        },
      },
      product_Vendor: {
        relation: Model.HasManyRelation,
        modelClass: product_to_vendor,
        join: {
          from: "products.product_id",
          to: "product_to_vendor.product_id",
        },
      },
    };
  }
}

module.exports = products;
