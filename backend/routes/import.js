const express = require("express");
const AWS = require("aws-sdk");
const sharp = require("sharp");
const s3Utils = require("../aws/s3Utils"); // Importing the S3 utility from the new location
const router = express.Router();
const knexConfig = require("../mysql/knexfile");
const knex = require("knex")(knexConfig);
const jwt = require("jsonwebtoken");
const cron = require("cron");
const fs = require("fs");
const XLSX = require("xlsx");
const Joi = require("joi");
const { Console } = require("console");



// File upload route
router.post("/import", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
          return res.status(403).send("Token Required");
        }
      const decoded = jwt.verify(token, "godisgreat");
      const userId = decoded.id;
  const fileName = req.body;
    const presignedUrl = await s3Utils.generatePresignedUrl(fileName, userId);


  // Insert file metadata into the 'files' table
  const [fileRecord] = await knex("files").insert({
    user_id: userId,
    file_name: fileName,
    file_url: `https://akv-interns.s3.ap-south-1.amazonaws.com/Mahesh%40AKV7082/${userId}/uploaded-products/${fileName}.xlsx`,
    total_rows: 0,
    rejected_file_s3_url: "",
    status: "Pending",
  });

  const fileId = fileRecord;
  console.log(fileId);
  res
    .status(200)
    .json({ message: "File uploaded and queued for processing", presignedUrl });
});

router.post("/add-file", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  console.log(token);
  if (!token) {
    return res.status(403).send("Token Required");
  }
  const decoded = jwt.verify(token, "godisgreat");
  const userId = decoded.id;
  const fileName = req.body;
   const [fileRecord] = await knex("files").insert({
     user_id: userId,
     file_name: fileName,
     file_url: `https://akv-interns.s3.ap-south-1.amazonaws.com/Mahesh%40AKV7082/${userId}/uploaded-products/${fileName}.xlsx`,
     total_rows: 0,
     rejected_file_s3_url: "",
     status: "Pending",
   });
    ;

  const fileId = fileRecord;
  console.log(fileId);
  res
    .status(200)
    .json({ message: "File uploaded and queued for processing", fileId });
})

// Get files for a specific user
router.get("/getFiles", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(403).send("Token Required");
  }
  const decoded = jwt.verify(token, "godisgreat");
  const userId = decoded.id;
  const files = await knex("files").where({ user_id: userId });

  if (!files || files.length === 0) {
    return res.status(404).json({ error: "Files not found" });
  }

  res.status(200).json(files);
});

let categoryMap = new Map();
let vendorMap = new Map();
// Create a map of categories and vendors for fast lookup

 


 const productSchema =  Joi.object({
   product_name: Joi.string().required().messages({
     "string.empty": "Product name is required.",
   }),
   quantity_in_stock: Joi.number().integer().min(0).required().messages({
     "number.base": "Quantity in stock must be a number.",
     "number.min": "Quantity in stock cannot be negative.",
   }),
   unit_price: Joi.number().positive().required().messages({
     "number.base": "Unit price must be a number.",
     "number.positive": "Unit price must be greater than 0.",
   }),
   category_name: Joi.string().required().messages({
     "string.empty": "Category name is required.",
   }),
   vendors: Joi.array().items(Joi.string()).min(1).required().messages({
     "array.min": "At least one vendor is required.",
   }),
 });

router.get("/cronJob", async (req, res,next) => {
  try {

    const categories = await knex("categories").select(
      "category_id",
      "category_name"
    );
    const vendors = await knex("vendors").select("vendor_id", "vendor_name");

    categoryMap = new Map(
      categories.map((cat) => [cat.category_name, cat.category_id])
    );
    vendorMap = new Map(
      vendors.map((vendor) => [vendor.vendor_name, vendor.vendor_id])
    );

    const files = await getFilesToProcess();
    for (const file of files) {
      const filePath = `${file.user_id}/uploaded-products/${file.file_name}`;
      const productsData = await getProductsDataFromFile(filePath); // Fetch the data from S3
      // console.log(productsData);
      await processFile(file, productsData); // Process the file directly
    }
    res.status(200).send("job completed successfully");
  }
  catch (err) {
    next(err);
  }
});

// Function to process file directly
async function processFile(file, productsData) {
  const user_id = file.user_id;
  const errors = [];
  const insertedProducts = [];
  const totalRows = productsData.length;
  let count = 0;

  // Create a new file record in the database to track progress
   await knex("files")
    .update({
      total_rows: totalRows,
      status: "Processing",
    })
    .where({ id: file.id });
   
  // Validate and process data
  for (const product of productsData) {
  //  console.log(product);
    let val = true;
    count++;
  //  console.log(product);
    try {
      const { error, value } = await productSchema.validateAsync(product, {
        abortEarly: false,
      });
      
       
    } catch (err) {
   //   console.error("Validation error:", err);
      errors.push({
        ...product,
        error: err.details.map((detail) => detail.message).join("," ),
      });
      //   console.log("error: " + errors[errors.length - 1].error);
      
      val = false;
    }
    const categoryId = categoryMap.get(product.category_name);
    const invalidVendors = [];
    const vendorIds = [];
    for (const vendorName of product.vendors) {
      const vendorId = vendorMap.get(vendorName);
      if (!vendorId) {
        invalidVendors.push(vendorName);
      } else {
        vendorIds.push(vendorId);
      }
    }

    
    if (!categoryId && product.category_name) {
      if (!val) {
        errors[errors.length - 1].error += "Category not found.";
      } else {
        errors.push({
          ...product,
          error: "Category not found.",
        });
      }
      val = false;
      // console.log(errors[errors.length - 1].error);
    }
    if (invalidVendors.length > 0) {
      if (!val) {
        errors[
          errors.length - 1
        ].error += `Vendors not found: ${invalidVendors.join(", ")}`;
      } else {
        errors.push({
          ...product,
          error: `Vendors not found: ${invalidVendors.join(", ")}`,
        });
      }
      val = false;
    }



    if (val===false)
      continue;

     const [productId] = await knex("products")
       .insert({
         product_name: product.product_name,
         category_id: categoryId,
         quantity_in_stock: product.quantity_in_stock,
         unit_price: product.unit_price,
         product_image: product.product_image || "default_image.jpg",
         status: "active",
       })
       .returning("product_id");

     insertedProducts.push({ product_id: productId });

     // Associate product with vendors in product_to_vendor table
     for (const vendorId of vendorIds) {
       await knex("product_to_vendor").insert({
         product_id: productId,
         vendor_id: vendorId,
         status: 1, // Default status to active
       });
     }
  }
   


  // Handle errors and save the error file
  if (errors.length > 0) {
const formattedData =errors.map((product) => ({
      "Product Name": product.product_name,
      Category: product.category_name,
      "Vendor Name": product.vendors
        .join(", "),
      Quantity: product.quantity_in_stock,
      "Unit Price": product.unit_price,
       "error":product.error
    }));
    const ws = XLSX.utils.json_to_sheet(formattedData);
    const wb = {
      SheetNames: ["Sheet1"], // Sheet name(s)
      Sheets: {
        Sheet1: ws, // The actual worksheet
      },
    };
const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "buffer" });

    try {
      const s3Url = await s3Utils.uploadToS3(
        excelBuffer,
        `${user_id}/error-products/${file.id}-errors`,
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      await knex("files").where({ id: file.id }).update({
        status: "Completed",
        rejected_rows: errors.length,
        rejected_file_s3_url: s3Url,
      });
    } catch (error) {
      console.error("Error uploading to S3:", error);

    }
  }

  // Mark the file as completed
  await knex("files").where({ id: file.id }).update({
    status: "Completed",
    products_added:(totalRows-errors.length),
  });

  return { status: "success", insertedProducts };
}

// Function to get files that need to be processed (status is 'Pending')
async function getFilesToProcess() {
  return await knex("files")
    .where("status", "Pending")
    .select("id", "user_id", "file_name", "file_url");
}

// Function to simulate reading product data from an S3-hosted file
async function getProductsDataFromFile(fileUrl) {
  const fileBuffer =await s3Utils.downloadFileFromS3(fileUrl);
  //console.log(fileBuffer);
  const workbook = XLSX.read(fileBuffer, { type: "buffer" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const productsData = XLSX.utils.sheet_to_json(sheet);
 // console.log("parsing " + productsData);
  return productsData.map((product) => {
    const vendors = product["Vendor Name"]
      ? product["Vendor Name"].split(",").map((vendorName) => vendorName.trim())
      : [];
    const quantityInStock = parseInt(product["Quantity"], 10); // Convert to integer
    const unitPrice = parseFloat(product["Unit Price"]); // Convert to float
    return {
      product_name: product["Product Name"] || "",
      category_name: product["Category"] || "",
      quantity_in_stock: isNaN(quantityInStock) ? undefined : quantityInStock, // Check if valid number
      unit_price: isNaN(unitPrice) ? undefined : unitPrice, // Check if valid number
      vendors,
    };
  });
}


module.exports = router;
