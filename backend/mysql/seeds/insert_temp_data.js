exports.seed = function (knex) {
  // Deletes ALL existing entries
  return knex("users")
    .del()
    .then(() => knex("product_to_vendor").del())
    .then(() => knex("vendors").del())
    .then(() => knex("products").del())
    .then(() => knex("categories").del())
    .then(function () {
      // Inserts seed entries into the categories table
      return knex("categories").insert([
        {
          category_name: "Electronics",
          description: "Devices and gadgets",
          status: "active",
        },
        {
          category_name: "Clothing",
          description: "Apparel and accessories",
          status: "active",
        },
        {
          category_name: "Furniture",
          description: "Home furniture",
          status: "active",
        },
        {
          category_name: "Books",
          description: "Books and literature",
          status: "active",
        },
        {
          category_name: "Toys",
          description: "Toys and games for children",
          status: "active",
        },
        {
          category_name: "Beauty",
          description: "Beauty and personal care products",
          status: "active",
        },
      ]);
    })
    .then(function () {
      // Inserts seed entries into the vendors table
      return knex("vendors").insert([
        {
          vendor_name: "Tech World",
          contact_name: "John Doe",
          address: "123 Tech Street, Silicon Valley",
          city: "San Francisco",
          postal_code: "94105",
          country: "USA",
          phone: "123-456-7890",
          status: "active",
        },
        {
          vendor_name: "Fashion Hub",
          contact_name: "Jane Smith",
          address: "456 Fashion Ave, New York",
          city: "New York",
          postal_code: "10001",
          country: "USA",
          phone: "987-654-3210",
          status: "active",
        },
        {
          vendor_name: "Home Comforts",
          contact_name: "Emma Brown",
          address: "789 Home Street, Chicago",
          city: "Chicago",
          postal_code: "60606",
          country: "USA",
          phone: "555-555-5555",
          status: "active",
        },
        {
          vendor_name: "Book Haven",
          contact_name: "Mark Green",
          address: "101 Book Road, Boston",
          city: "Boston",
          postal_code: "02110",
          country: "USA",
          phone: "123-321-1234",
          status: "active",
        },
        {
          vendor_name: "Toy World",
          contact_name: "Sophie White",
          address: "202 Toy Lane, Los Angeles",
          city: "Los Angeles",
          postal_code: "90001",
          country: "USA",
          phone: "321-432-5432",
          status: "active",
        },
      ]);
    })
    .then(function () {
      // Inserts seed entries into the products table
      return knex("products").insert([
        {
          product_name: "Smartphone",
          category_id: 1,
          quantity_in_stock: 100,
          unit_price: 299.99,
          product_image: "smartphone.jpg",
          full_image: "smartphone_full.jpg",
          status: "active",
        },
        {
          product_name: "Laptop",
          category_id: 1,
          quantity_in_stock: 50,
          unit_price: 799.99,
          product_image: "laptop.jpg",
          full_image: "laptop_full.jpg",
          status: "active",
        },
        {
          product_name: "Smart Watch",
          category_id: 1,
          quantity_in_stock: 200,
          unit_price: 149.99,
          product_image: "smartwatch.jpg",
          full_image: "smartwatch_full.jpg",
          status: "active",
        },
        {
          product_name: "T-shirt",
          category_id: 2,
          quantity_in_stock: 200,
          unit_price: 19.99,
          product_image: "tshirt.jpg",
          full_image: "tshirt_full.jpg",
          status: "active",
        },
        {
          product_name: "Jeans",
          category_id: 2,
          quantity_in_stock: 150,
          unit_price: 49.99,
          product_image: "jeans.jpg",
          full_image: "jeans_full.jpg",
          status: "active",
        },
        {
          product_name: "Sofa",
          category_id: 3,
          quantity_in_stock: 30,
          unit_price: 499.99,
          product_image: "sofa.jpg",
          full_image: "sofa_full.jpg",
          status: "active",
        },
        {
          product_name: "Dining Table",
          category_id: 3,
          quantity_in_stock: 20,
          unit_price: 299.99,
          product_image: "dining_table.jpg",
          full_image: "dining_table_full.jpg",
          status: "active",
        },
        {
          product_name: "Cookbook",
          category_id: 4,
          quantity_in_stock: 50,
          unit_price: 19.99,
          product_image: "cookbook.jpg",
          full_image: "cookbook_full.jpg",
          status: "active",
        },
        {
          product_name: "Novel",
          category_id: 4,
          quantity_in_stock: 120,
          unit_price: 9.99,
          product_image: "novel.jpg",
          full_image: "novel_full.jpg",
          status: "active",
        },
        {
          product_name: "Toy Car",
          category_id: 5,
          quantity_in_stock: 300,
          unit_price: 9.99,
          product_image: "toy_car.jpg",
          full_image: "toy_car_full.jpg",
          status: "active",
        },
        {
          product_name: "Lego Set",
          category_id: 5,
          quantity_in_stock: 100,
          unit_price: 39.99,
          product_image: "lego_set.jpg",
          full_image: "lego_set_full.jpg",
          status: "active",
        },
        {
          product_name: "Shampoo",
          category_id: 6,
          quantity_in_stock: 150,
          unit_price: 8.99,
          product_image: "shampoo.jpg",
          full_image: "shampoo_full.jpg",
          status: "active",
        },
        {
          product_name: "Face Cream",
          category_id: 6,
          quantity_in_stock: 80,
          unit_price: 15.99,
          product_image: "face_cream.jpg",
          full_image: "face_cream_full.jpg",
          status: "active",
        },
      ]);
    })
    .then(function () {
      // Inserts seed entries into the product_to_vendor relationship table
      return knex("product_to_vendor").insert([
        { vendor_id: 1, product_id: 1, status: "active" },
        { vendor_id: 1, product_id: 2, status: "active" },
        { vendor_id: 2, product_id: 3, status: "active" },
        { vendor_id: 2, product_id: 4, status: "active" },
        { vendor_id: 3, product_id: 5, status: "active" },
        { vendor_id: 3, product_id: 6, status: "active" },
        { vendor_id: 4, product_id: 7, status: "active" },
        { vendor_id: 4, product_id: 8, status: "active" },
        { vendor_id: 5, product_id: 9, status: "active" },
        { vendor_id: 5, product_id: 10, status: "active" },
        { vendor_id: 3, product_id: 11, status: "active" },
        { vendor_id: 3, product_id: 12, status: "active" },
      ]);
    })
    .then(function () {
      // Inserts seed entries into the users table
      return knex("users").insert([
        {
          first_name: "Alice",
          username: "alice123",
          password: "password123",
          email: "alice@example.com",
          profile_pic: "alice.jpg",
          thumbnail: "alice_thumbnail.jpg",
          status: "active",
        },
        {
          first_name: "Bob",
          username: "bob456",
          password: "password456",
          email: "bob@example.com",
          profile_pic: "bob.jpg",
          thumbnail: "bob_thumbnail.jpg",
          status: "active",
        },
        {
          first_name: "Charlie",
          username: "charlie789",
          password: "password789",
          email: "charlie@example.com",
          profile_pic: "charlie.jpg",
          thumbnail: "charlie_thumbnail.jpg",
          status: "active",
        },
        {
          first_name: "David",
          username: "david321",
          password: "password321",
          email: "david@example.com",
          profile_pic: "david.jpg",
          thumbnail: "david_thumbnail.jpg",
          status: "active",
        },
      ]);
    });
};
