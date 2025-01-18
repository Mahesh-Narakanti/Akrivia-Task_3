exports.up = function (knex) {
  return (
    knex.schema
      // Create the categories table
      .createTable("categories", function (table) {
        table.increments("category_id").primary();
        table.string("category_name").notNullable();
        table.text("description");
        table
          .enu("status", ["default", "active", "inactive", "deleted"])
          .defaultTo("default");
        table.timestamp("created_at").defaultTo(knex.fn.now());
      })
      .raw(
        `
      ALTER TABLE categories 
      ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
    `
      )

      // Create the products table
      .createTable("products", function (table) {
        table.increments("product_id").primary();
        table.string("product_name").notNullable();
        table
          .integer("category_id")
          .unsigned()
          .references("category_id")
          .inTable("categories")
          .onDelete("SET NULL");
        table.integer("quantity_in_stock").defaultTo(0);
        table.decimal("unit_price", 10, 2).notNullable();
        table.string("product_image");
        table.string("full_image");
        table
          .enu("status", ["default", "active", "inactive", "deleted"])
          .defaultTo("default");
        table.timestamp("created_at").defaultTo(knex.fn.now());
      })
      .raw(
        `
      ALTER TABLE products
      ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
    `
      )

      // Create the vendors table
      .createTable("vendors", function (table) {
        table.increments("vendor_id").primary();
        table.string("vendor_name").notNullable();
        table.string("contact_name");
        table.text("address");
        table.string("city");
        table.string("postal_code");
        table.string("country");
        table.string("phone");
        table
          .enu("status", ["default", "active", "inactive", "deleted"])
          .defaultTo("default");
        table.timestamp("created_at").defaultTo(knex.fn.now());
      })
      .raw(
        `
      ALTER TABLE vendors
      ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
    `
      )

      // Create the product_to_vendor relationship table
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
        table
          .enu("status", ["default", "active", "inactive", "deleted"])
          .defaultTo("default");
        table.timestamp("created_at").defaultTo(knex.fn.now());
      })
      .raw(
        `
      ALTER TABLE product_to_vendor
      ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
    `
      )

      // Create the users table
      .createTable("users", function (table) {
        table.increments("id").primary();
        table.string("first_name").notNullable();
        table.string("username").notNullable().unique();
        table.string("password").notNullable();
        table.string("email").notNullable().unique();
        table.string("profile_pic");
        table.string("thumbnail");
        table
          .enu("status", ["default", "active", "inactive", "deleted"])
          .defaultTo("default");
        table.timestamp("created_at").defaultTo(knex.fn.now());
      }).raw(`
      ALTER TABLE users
      ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
    `)
  );
};

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists("users")
    .dropTableIfExists("product_to_vendor")
    .dropTableIfExists("vendors")
    .dropTableIfExists("products")
    .dropTableIfExists("categories");
};
