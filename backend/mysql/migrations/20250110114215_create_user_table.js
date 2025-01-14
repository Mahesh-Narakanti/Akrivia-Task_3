/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    .createTable("categories", function (table) {
      table.increments("category_id").primary();
      table.string("category_name").notNullable();
      table.text("description");
      table.enu("status", [0, 1, 2, 99]).defaultTo(0); // 0: created, 1: active, 2: inactive, 99: deleted
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("updated_at").defaultTo(knex.fn.now());
    })
    .createTable("products", function (table) {
      table.increments("product_id").primary();
      table.string("product_name").notNullable();
      table
        .integer("category_id")
        .unsigned()
        .references("category_id")
        .inTable("categories")
        .onDelete("CASCADE");
      table.integer("quantity_in_stock").unsigned();
      table.decimal("unit_price", 14, 2); // Store the price with two decimal places
      table.string("product_image");
      table.enu("status", [0, 1, 2, 99]).defaultTo(0); // 0: created, 1: active, 2: inactive, 99: deleted
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("updated_at").defaultTo(knex.fn.now());
    })
    .createTable("vendors", function (table) {
      table.increments("vendor_id").primary();
      table.string("vendor_name").notNullable();
      table.string("contact_name");
      table.string("address");
      table.string("city");
      table.string("postal_code");
      table.string("country");
      table.string("phone");
      table.enu("status", [0, 1, 2, 99]).defaultTo(0); // 0: created, 1: active, 2: inactive, 99: deleted
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("updated_at").defaultTo(knex.fn.now());
    })
    .createTable("product_to_vendor", function (table) {
      table.increments("product_to_vendor_id").primary();
      table
        .integer("vendor_id")
        .unsigned()
        .references("vendor_id")
        .inTable("vendors")
        .onDelete("CASCADE");
      table
        .integer("product_id")
        .unsigned()
        .references("product_id")
        .inTable("products")
        .onDelete("CASCADE");
      table.enu("status", [0, 1, 2, 99]).defaultTo(0); // 0: created, 1: active, 2: inactive, 99: deleted
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("updated_at").defaultTo(knex.fn.now());
    })
    .createTable("users", function (table) {
      table.increments("id").primary();
      table.string("first_name");
      table.string("last_name");
      table.string("username").unique().notNullable();
      table.string("password").notNullable();
      table.string("email").unique().notNullable();
      table.string("profile_pic").defaultTo(" "); // URL or file path to the profile picture
      table.string("thumbnail").defaultTo(" "); // URL or file path to the thumbnail image
      table.enu("status", [0, 1, 2, 99]).defaultTo(0); // 0: created, 1: active, 2: inactive, 99: deleted
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("updated_at").defaultTo(knex.fn.now());
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema
      .dropTableIfExists("users")
      .dropTableIfExists("product_to_vendor")
      .dropTableIfExists("vendors")
      .dropTableIfExists("products")
      .dropTableIfExists("categories");
};
