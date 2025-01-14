const { Model } = require("objection");
const products = require("./products");

class categories extends Model {
  static get tableName() {
    return "categories";
  }

  static get relationMappings() {
    return {
      product: {
        relation: Model.BelongsToOneRelation, // A category can have multiple products, each product belongs to one category
        modelClass: products,
        join: {
          from: "categories.category_id",
          to: "products.category_id",
        },
      },
    };
  }
}

module.exports = categories;
