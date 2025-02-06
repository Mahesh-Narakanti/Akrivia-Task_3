const AWS = require("aws-sdk");
require("dotenv").config();
const logger = require("../logger");
const { Console } = require("winston/lib/winston/transports");

// AWS S3 Configuration
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();

// Helper function to upload a file to S3
async function uploadToS3(fileBuffer, key,contentType) {
  const params = {
    Bucket: "akv-interns", 
    Key: `Mahesh@AKV7082/${key}`, 
    Body: fileBuffer,
    ContentType: contentType,
  };

  try {
  //  logger.info("Uploading to S3 with params:", params); 
    const data = await s3.upload(params).promise();
   // logger.info("Upload success:", data); 
    return data.Location;
  } catch (error) {
    logger.error("Error uploading to S3:", error); 
    throw new Error("Error uploading file to S3");
  }
}

async function getFileFromS3(key) {
  const params = {
    Bucket: "akv-interns",
    Prefix: `Mahesh@AKV7082/${key}`, // The key to access the specific file
  };

  try {
    logger.info("Fetching file from S3 with params:", params);
    const data = await s3.listObjectsV2(params).promise();
    logger.info("File fetched successfully:", data.Contents);
 
    return data; // This will return the file content (Buffer)
  } catch (error) {
    logger.error("Error fetching file from S3:", error);
    throw new Error("Error fetching file from S3");
  }
}

async function downloadFileFromS3(key) {
  const params = {
    Bucket: "akv-interns",
    Key: `Mahesh@AKV7082/${key}`, // Using the full key
  };

  try {
    logger.info("Fetching file from S3 with params:", params);
    const data = await s3.getObject(params).promise(); // Get the file content
  //  logger.info("File fetched successfully:", data);
  //  console.log(data.body);
    return data.Body; // This will return the file as a Buffer
  } catch (error) {
    logger.error("Error fetching file from S3:", error);
    throw new Error("Error fetching file from S3");
  }
}

async function generatePresignedUrl(fileName, userId) {
  const s3Params = {
    Bucket: "akv-interns", // Your S3 bucket name
    Key: `Mahesh@AKV7082/${userId}/uploaded-products/${fileName}`, // Key for the uploaded file
    Expires: 60 * 5, // URL expiration time (in seconds) - e.g., 5 minutes
    ContentType: "xlsx", // Expected content type (can adjust if needed)
  };

  try {
    const presignedUrl = s3.getSignedUrl("putObject", s3Params); // Generate the URL
    return presignedUrl;
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    throw new Error("Error generating presigned URL");
  }
}

async function uploadToAdminS3(fileBuffer, key, contentType) {
  const params = {
    Bucket: "akv-interns",
    Key: `Mahesh@AKV7082/${key}`,
    Body: fileBuffer,
    ContentType: contentType,
  };

  try {
    //  logger.info("Uploading to S3 with params:", params);
    const data = await s3.upload(params).promise();
    // logger.info("Upload success:", data);
    return data.Location;
  } catch (error) {
    logger.error("Error uploading to S3:", error);
    throw new Error("Error uploading file to S3");
  }
}

module.exports = { uploadToS3 ,getFileFromS3 , downloadFileFromS3,generatePresignedUrl,uploadToAdminS3};
