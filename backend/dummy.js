const XLSX = require("xlsx");
const { faker } = require("@faker-js/faker"); // Import the correct faker package

// Predefined categories and vendors
const categories = [
  "Electronics",
  "Clothing",
  "Furniture",
  "Books",
  "Toys",
  "Beauty",
  "Groceries",
];

// Extended vendors list with additional random vendors
const vendors = [
  "Tech World",
  "Fashion Hub",
  "Home Comforts",
  "Book Haven",
  "Toy World",
  "Blinkit",
  "Zepto",
  "BigBasket",
  "Swiggy",
  "Rapido",
  "Amazon", // Additional vendor
  "BestBuy", // Additional vendor
  "AliExpress", // Additional vendor
  "Walmart", // Additional vendor
  "Flipkart", // Additional vendor
  "Myntra", // Additional vendor
  "eBay", // Additional vendor
];

// Helper function to generate random data
function generateRow() {
  const productName = faker.commerce.productName();
  const category = categories[Math.floor(Math.random() * categories.length)];
  const vendor = vendors[Math.floor(Math.random() * vendors.length)];
  const quantity = faker.number.int({ min: 1, max: 100 }); // Random quantity
  const unitPrice = faker.commerce.price(); // Random price

  // 10% chance of having missing or empty fields
  const shouldHaveEmptyField = Math.random() < 0.1;

  return {
    "Product Name": shouldHaveEmptyField ? "" : productName,
    Category: shouldHaveEmptyField ? "" : category,
    "Vendor Name": shouldHaveEmptyField ? "" : vendor,
    Quantity: shouldHaveEmptyField ? "" : quantity,
    "Unit Price": shouldHaveEmptyField ? "" : unitPrice,
  };
}

// Generate 5000 rows
const rows = [];
for (let i = 0; i < 50000; i++) {
  rows.push(generateRow());
}

// Define headers
const headers = [
  "Product Name",
  "Category",
  "Vendor Name",
  "Quantity",
  "Unit Price",
];

// Create worksheet
const ws = XLSX.utils.json_to_sheet(rows, { header: headers });

// Create workbook
const wb = {
  SheetNames: ["Sheet1"],
  Sheets: {
    Sheet1: ws,
  },
};

// Write the file to disk
XLSX.writeFile(wb, "dummy_data-50000.xlsx");

console.log(
  "Excel file with dummy data generated: dummy_data_with_more_vendors.xlsx"
);
