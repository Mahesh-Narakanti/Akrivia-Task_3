const express = require("express");
const AWS = require("aws-sdk");
const sharp = require("sharp");
const s3Utils = require("../aws/s3Utils");
const router = express.Router();
const knexConfig = require("../mysql/knexfile");
const knex = require("knex")(knexConfig);
const jwt = require("jsonwebtoken");
const cron = require("cron");
const fs = require("fs");
const XLSX = require("xlsx");
const Joi = require("joi");

let categoryMap = new Map();
let vendorMap = new Map();

function chunkArray(array, chunkSize) {
  const result = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    result.push(array.slice(i, i + chunkSize));
  }
  return result;
}

const productSchema = Joi.object({
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

 async function validateProducts(productsData,branch_id) {
  const validProducts = [];
  const errors = [];
  let count = 0;
  for (const product of productsData) {
    let val = true;
    count++;
    try {
      const { error, value } = await productSchema.validateAsync(product, {
        abortEarly: false,
      });
    } catch (err) {
      errors.push({
        ...product,
        error: err.details.map((detail) => detail.message).join(","),
      });

      val = false;
    }
    const categoryId = categoryMap.get(product.category_name);
    const invalidVendors = [];
    for (const vendorName of product.vendors) {
      const vendorId = vendorMap.get(vendorName);
      if (!vendorId) {
        invalidVendors.push(vendorName);
      }
    }
    //  console.log(categoryId);
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
    if (product.product_name) {
      const isThere = await knex("products")
        .where("product_name", product.product_name)
        .andWhereNot("status", "deleted")
        .andWhere("branch_id", branch_id)
        .first();
      if (isThere) {
        errors = [];
        errors.push({
          ...product,
          error: `Duplicate Product  found`,
        });
        val = false;
      }
    }
    if (val) validProducts.push(product);
  }
  return { validProducts, errors };
}

async function createErrorFile(errors, file) {
  const user_id = file.user_id;
  const formattedData = errors.map((product) => ({
    "Product Name": product.product_name,
    Category: product.category_name,
    "Vendor Name": product.vendors.join(", "),
    Quantity: product.quantity_in_stock,
    "Unit Price": product.unit_price,
    error: product.error,
  }));
  const ws = XLSX.utils.json_to_sheet(formattedData);
  const wb = {
    SheetNames: ["Sheet1"],
    Sheets: {
      Sheet1: ws,
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
      rejected_rows: errors.length,
      rejected_file_s3_url: s3Url,
    });
  } catch (error) {
    console.error("Error uploading to S3:", error);
  }
}

function startCronJob(io) {
  const cronJob = new cron.CronJob("*/1 * * * *", async () => {
    const categories = await knex("categories").select(
      "category_id",
      "category_name"
    );
    const vendors = await knex("vendors").select("vendor_id", "vendor_name");

    categoryMap = new Map(
      categories.map((cat) => [cat.category_name, cat.category_id])
    );
    //[categoryname,categoryid],[categorya,catid]
    //{categoryname:categoryid,categoryA:catid,categoryB:catid}
    vendorMap = new Map(
      vendors.map((vendor) => [vendor.vendor_name, vendor.vendor_id])
    );

    const filesToProcess = await getFilesToProcess();
    for (const file of filesToProcess) {
      let startTime = Date.now();
      //console.log(file);
      const filePath = `${file.user_id}/uploaded-products/${file.file_name}`;
      io.to(`/user/${file.user_id}`).emit("notification", {
        message: `Your file "${file.file_name}" is being processed.`,
        status: "success",
      });

      await knex("files")
        .update({
          status: "Processing",
        })
        .where({ id: file.id });

      const productsData = await getProductsDataFromFile(filePath); // Fetch the data from S3

      await knex("files")
        .update({
          total_rows: productsData.length,
        })
        .where({ id: file.id });

      let endTime = Date.now();
      console.log("time taken= " + (endTime - startTime) / 1000);
      startTime = Date.now();

      const { validProducts, errors } = await validateProducts(productsData,file.branch_id);

      endTime = Date.now();
      console.log("time taken= " + (endTime - startTime) / 1000);
      startTime = Date.now();
      // console.log(productsData);
      //await processFile(file, validProducts); // Process the file directly
      const
        chunkedData = chunkArray(validProducts, 1000);

      const concurrencyLimit = 500; // Number of concurrent chunks to process

      const processChunkWithLimit = async (chunks) => {
        const results = [];
        for (let i = 0; i < chunks.length; i += concurrencyLimit) {
          const chunkGroup = chunks.slice(i, i + concurrencyLimit);
          const promises = chunkGroup.map((chunk) => processFile(file, chunk));
          results.push(...(await Promise.all(promises)));
        }
        return results;
      };

      await processChunkWithLimit(chunkedData);
      // for (const productsData of chunkedData) {
      //   await processFile(file, productsData); // Process each chunk one by one
      // }

      await knex("files").where({ id: file.id }).update({
        status: "Completed",
        products_added: validProducts.length,
      });

      endTime = Date.now();
      console.log("time taken= " + (endTime - startTime) / 1000);
      startTime = Date.now();

      if (errors.length > 0) {
        await createErrorFile(errors, file);
      }

      io.to(`/user/${file.user_id}`).emit("notification", {
        message: `Your file "${file.file_name}" has been processed successfully.`,
        status: "success",
      });
      endTime = Date.now();
      console.log("time taken= " + (endTime - startTime) / 1000);
    }
  });
  cronJob.start();
}

// Function to process file directly
async function processFile(file, productsData) {
  const user_id = file.user_id;
  const errors = [];
  const insertedProducts = [];
  const totalRows = productsData.length;
  let count = 0;

  for (const product of productsData) {
    
    const isThere = await knex("products")
      .where("product_name", product.product_name)
      .andWhereNot("status", "deleted")
      .andWhere("branch_id", file.branch_id)
      .first();
    if (isThere)
    {

    }
    const [productId] = await knex("products").insert({
      product_name: product.product_name,
      category_id: categoryMap.get(product.category_name),
      quantity_in_stock: product.quantity_in_stock,
      unit_price: product.unit_price,
      product_image: product.product_image || "default_image.jpg",
      status: "active",
      branch_id:file.branch_id
    });
    // console.log(productId);
    insertedProducts.push({ product_id: productId });

    for (const vendor of product.vendors) {
      await knex("product_to_vendor").insert({
        product_id: productId,
        vendor_id: vendorMap.get(vendor),
        status: 1, // Default status to active
      });
    }
  }

  return { status: "success", insertedProducts };
}

// Function to get files that need to be processed (status is 'Pending')
async function getFilesToProcess() {
  return await knex("files")
    .where("status", "Pending")
    .select("id", "user_id", "file_name", "file_url","branch_id");
}

// Function to simulate reading product data from an S3-hosted file
async function getProductsDataFromFile(fileUrl) {
  const fileBuffer = await s3Utils.downloadFileFromS3(fileUrl);
  //console.log(fileBuffer);
  const workbook = XLSX.read(fileBuffer, { type: "buffer" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const productsData = XLSX.utils.sheet_to_json(sheet);
  // console.log("parsing " + productsData);
  return productsData.map((product) => {
    const vendors = product["Vendor Name"]
      ? product["Vendor Name"].split(",").map((vendorName) => vendorName.trim())
      : [];
    const quantityInStock = parseInt(product["Quantity"], 10);
    const unitPrice = parseFloat(product["Unit Price"]);
    return {
      product_name: product["Product Name"] || "",
      category_name: product["Category"] || "",
      quantity_in_stock: isNaN(quantityInStock) ? undefined : quantityInStock,
      unit_price: isNaN(unitPrice) ? undefined : unitPrice,
      vendors,
    };
  });
}

module.exports = startCronJob;
