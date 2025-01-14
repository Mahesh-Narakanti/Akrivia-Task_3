/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex("product_to_vendor").del();
  await knex("products").del();
  await knex("vendors").del();
  await knex("categories").del();

  // Insert data into categories first
  await knex("categories").insert([
    {
      category_name: "Electronics",
      description: "Devices and gadgets",
      status: 1,
    },
    {
      category_name: "Furniture",
      description: "Office and home furniture",
      status: 1,
    },
    {
      category_name: "Groceries",
      description: "Daily food and supplies",
      status: 1,
    },
    {
      category_name: "Clothing",
      description: "Apparel and accessories",
      status: 1,
    },
  ]);

  // Insert data into vendors
  await knex("vendors").insert([
    {
      vendor_name: "Zepto",
      contact_name: "John Doe",
      address: "123 Zepto St.",
      city: "New York",
      postal_code: "10001",
      country: "USA",
      phone: "123-456-7890",
      status: 1,
    },
    {
      vendor_name: "Blinkit",
      contact_name: "Jane Smith",
      address: "456 Blinkit Rd.",
      city: "San Francisco",
      postal_code: "94105",
      country: "USA",
      phone: "987-654-3210",
      status: 1,
    },
    {
      vendor_name: "Swiggy",
      contact_name: "Tom Brown",
      address: "789 Swiggy Blvd.",
      city: "Chicago",
      postal_code: "60601",
      country: "USA",
      phone: "555-123-4567",
      status: 1,
    },
    {
      vendor_name: "BigBasket",
      contact_name: "Alice Johnson",
      address: "101 BigBasket Ave.",
      city: "Los Angeles",
      postal_code: "90001",
      country: "USA",
      phone: "555-987-6543",
      status: 1,
    },
  ]);

  // Now insert data into products
  await knex("products").insert([
    {
      product_name: "Smartphone",
      category_id: 1,
      quantity_in_stock: 50,
      unit_price: 599.99,
      product_image: "assets/product1.jpg",
      status: 1,
    },
    {
      product_name: "Laptop",
      category_id: 1,
      quantity_in_stock: 30,
      unit_price: 999.99,
      product_image: "assets/product2.jpg",
      status: 1,
    },
    {
      product_name: "Office Chair",
      category_id: 2,
      quantity_in_stock: 20,
      unit_price: 129.99,
      product_image: "assets/product3.jpg",
      status: 1,
    },
    {
      product_name: "Sofa",
      category_id: 2,
      quantity_in_stock: 10,
      unit_price: 499.99,
      product_image: "assets/product4.jpg",
      status: 1,
    },
    {
      product_name: "Organic Apples",
      category_id: 3,
      quantity_in_stock: 100,
      unit_price: 2.99,
      product_image: "assets/product5.jpg",
      status: 1,
    },
    {
      product_name: "Milk Pack",
      category_id: 3,
      quantity_in_stock: 150,
      unit_price: 1.49,
      product_image: "assets/product6.jpg",
      status: 1,
    },
    {
      product_name: "T-shirt",
      category_id: 4,
      quantity_in_stock: 200,
      unit_price: 19.99,
      product_image: "assets/product7.jpg",
      status: 1,
    },
    {
      product_name: "Jeans",
      category_id: 4,
      quantity_in_stock: 150,
      unit_price: 39.99,
      product_image: "assets/product8.jpg",
      status: 1,
    },
  ]);

  // Insert data into product_to_vendor (relating products and vendors)
  await knex("product_to_vendor").insert([
    { vendor_id: 1, product_id: 1, status: 1 },
    { vendor_id: 2, product_id: 1, status: 1 },
    { vendor_id: 1, product_id: 2, status: 1 },
    { vendor_id: 3, product_id: 2, status: 1 },
    { vendor_id: 2, product_id: 3, status: 1 },
    { vendor_id: 3, product_id: 4, status: 1 },
    { vendor_id: 4, product_id: 5, status: 1 },
    { vendor_id: 1, product_id: 6, status: 1 },
    { vendor_id: 2, product_id: 7, status: 1 },
    { vendor_id: 4, product_id: 8, status: 1 },
  ]);
};
