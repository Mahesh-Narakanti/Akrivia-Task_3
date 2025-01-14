const AWS = require("aws-sdk");
require("dotenv").config();


// AWS S3 Configuration
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();

// Helper function to upload a file to S3
async function uploadToS3(fileBuffer, key) {
  const params = {
    Bucket: "akv-interns", // Replace with your actual S3 bucket name
    Key: `Mahesh@AKV7082/${key}`, // Path and filename inside your bucket
    Body: fileBuffer,
    ContentType: "application/octet-stream", // MIME type for image
  };

  try {
    console.log("Uploading to S3 with params:", params); // Log parameters
    const data = await s3.upload(params).promise();
    console.log("Upload success:", data); // Log the success response
    return data.Location;
  } catch (error) {
    console.error("Error uploading to S3:", error); // Log the full error message
    throw new Error("Error uploading file to S3");
  }
}

module.exports = { uploadToS3 };
