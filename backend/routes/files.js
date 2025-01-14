const express = require("express");
const AWS = require("aws-sdk");
const s3Utils = require("../aws/s3Utils"); // Your custom S3 utility for handling uploads
const router = express.Router();
require("dotenv").config();

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// Route to list uploaded files in the S3 bucket
router.get("/list-files", async (req, res) => {
  try {
    const params = {
      Bucket: "akv-interns", // Replace with your actual bucket name
      Prefix: "Mahesh@AKV7082/profile-pics",
    };

    // Fetch the list of objects in the S3 bucket
    const data = await s3.listObjectsV2(params).promise();

    // Map the results to just the file names (or URLs if needed)
    const files = data.Contents.map((file) => ({
      fileName: file.Key, // Or use file.Url if you need a full URL
    }));

    res.json(files);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving files from S3");
  }
});

module.exports = router;
