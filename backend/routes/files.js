const express = require("express");
const knexConfig = require("../mysql/knexfile");
const jwt = require("jsonwebtoken");
const knex = require("knex")(knexConfig);
const AWS = require("aws-sdk");
const sharp = require("sharp");
const s3Utils = require("../aws/s3Utils"); // Importing the S3 utility from the new location
const router = express.Router();

// Upload Route
router.post("/", async (req, res) => {
  try {
    // Binary data base64

    const fileContent = Buffer.from(req.files.uploadedFileName.data, "binary");

    // Upload the original image to S3
    const fileURL = await s3Utils.uploadToS3(
      fileContent,
      "profile-pics/" + req.files.uploadedFileName.name
    );

    // Send back URL
    res.json({
      fileURL: fileURL,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error uploading file");
  }
});

router.post("/add", async (req, res) => {
  try {
    // Get fileURL from the request body
    const { fileURL } = req.body;

    // Ensure fileURL is provided and valid
    if (!fileURL) {
      return res.status(400).json({
        message: "fileURL is required",
      });
    }

    // Insert file URL into the 'files' table
    const result = await knex("files").insert({ fileURL });

    // The result from insert() is an array, so we need to access the file_id from the first element
    const fileId = result[0];

    // Return success response
    res.status(201).json({
      message: "File added successfully",
      fileId: fileId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error adding files");
  }
});


// Route to list uploaded files in the S3 bucket
router.get("/list-files", async (req, res) => {
  try {
    // Fetch the list of objects in the S3 bucket
    const files = await knex("files").select("file_id", "fileURL");

    res.json(files);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving files");
  }
});

router.post("/download-all", async (req, res) => {
  try {
    const { fileUrls } = req.body; // Extract file URLs from the request body

    if (!fileUrls || fileUrls.length === 0) {
      return res.status(400).send("No files provided");
    }

    // Create a zip stream
    const zip = archiver("zip", {
      zlib: { level: 9 }, // Max compression
    });

    // Set the response headers to indicate it's a downloadable file
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", "attachment; filename=all_files.zip");

    // Pipe the zip file to the response
    zip.pipe(res);

    // Fetch each file URL from the database and add it to the ZIP
    for (const fileUrl of fileUrls) {

      const fileName = path.basename(fileUrl);

      // Assuming the file is stored locally, if the file is on an S3 bucket or external storage, you'll need a different approach
      const fileStream = fs.createReadStream(
        path.join(__dirname, "uploads", fileName)
      );

      // Append file to the zip
      zip.append(fileStream, { name: fileName });
    }

    // Finalize the zip file
    zip.finalize();
  } catch (error) {
    console.error("Error creating ZIP file:", error);
    res.status(500).send("Error creating ZIP file");
  }
});

module.exports = router;
