const s3Utils = require("../../aws/s3Utils"); // Import S3 utility
const knexConfig = require("../../mysql/knexfile"); // Assuming knexfile is in ../mysql/knexfile
const knex = require("knex")(knexConfig);
const archiver = require("archiver");
const fs = require("fs");
const path = require("path");

module.exports = {
  // Upload file to S3
  uploadToS3: async (fileContent, fileName) => {
    try {
      const fileURL = await s3Utils.uploadToS3(
        fileContent,
        "profile-pics/" + fileName
      );
      return fileURL;
    } catch (error) {
      throw new Error("Error uploading file to S3");
    }
  },

  // Add file URL to database
  addFileToDatabase: async (fileURL) => {
    try {
      const result = await knex("files").insert({ fileURL });
      const fileId = result[0]; // Get the inserted file ID
      return fileId;
    } catch (error) {
      throw new Error("Error adding file to database");
    }
  },

  // Fetch list of files from database
  getFilesFromDatabase: async () => {
    try {
      return await knex("files").select("file_id", "fileURL");
    } catch (error) {
      throw new Error("Error retrieving files from database");
    }
  },

  // Create ZIP file of all requested files
  // createZipForFiles: async (fileUrls, res) => {
  //   const zip = archiver("zip", {
  //     zlib: { level: 9 }, // Max compression
  //   });

  //   res.setHeader("Content-Type", "application/zip");
  //   res.setHeader("Content-Disposition", "attachment; filename=all_files.zip");

  //   zip.pipe(res);

  //   for (const fileUrl of fileUrls) {
  //     const fileName = path.basename(fileUrl);

  //     // Assuming the file is stored locally, you can replace this with S3 fetching logic
  //     const fileStream = fs.createReadStream(
  //       path.join(__dirname, "uploads", fileName)
  //     );

  //     zip.append(fileStream, { name: fileName });
  //   }

  //   zip.finalize();
  // },
};
