const AWS = require("aws-sdk");
require("dotenv").config();
const logger = require("../logger");

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
    logger.info("Uploading to S3 with params:", params); 
    const data = await s3.upload(params).promise();
    logger.info("Upload success:", data); 
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


module.exports = { uploadToS3 ,getFileFromS3};
