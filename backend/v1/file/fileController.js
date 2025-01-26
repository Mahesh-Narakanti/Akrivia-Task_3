const fileService = require("./fileService");
const logger = require("../../logger");
const s3Utils = require("../../aws/s3Utils"); // Import S3 utility
const jwt = require("jsonwebtoken");

module.exports = {
  // Upload file route controller
  uploadFile: async (req, res) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        return res.status(403).send("Token Required");
      }
      const decoded = jwt.verify(token, "godisgreat");
      const user_id = decoded.id;
      const fileContent = Buffer.from(
        req.files.uploadedFileName.data,
        "binary"
      );
      const extension = req.files.uploadedFileName.name
        .split(".")
        .pop()
        .toLowerCase();

      // Default Content-Type
      let contentType = "application/octet-stream";

      // Try to infer Content-Type based on file extension
      if (extension === "pdf") contentType = "application/pdf";
      else if (extension === "jpg" || extension === "jpeg")
        contentType = "image/jpeg";
      else if (extension === "png") contentType = "image/png";
      else if (extension === "txt") contentType = "text/plain";
      else if (extension === "xlsx")
        contentType =
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"; // For Excel files

      const fileURL = await s3Utils.uploadToS3(
        fileContent,
        user_id + "/product/" + req.files.uploadedFileName.name,
        contentType
      );

      res.json({ fileURL });
    } catch (error) {
      logger.error(error);
      res.status(500).send("Error uploading file");
    }
  },

  // Add file URL to the database route controller
  // addFile: async (req, res) => {
  //   try {
  //     const { fileURL } = req.body;

  //     if (!fileURL) {
  //       return res.status(400).json({ message: "fileURL is required" });
  //     }

  //     const fileId = await fileService.addFileToDatabase(fileURL);

  //     res.status(201).json({
  //       message: "File added successfully",
  //       fileId,
  //     });
  //   } catch (error) {
  //     logger.error(error);
  //     res.status(500).send("Error adding file");
  //   }
  // },

  // List files route controller
  listFiles: async (req, res) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        return res.status(403).send("Token Required");
      }
      const decoded = jwt.verify(token, "godisgreat");
      const user_id = decoded.id;
      const data = await s3Utils.getFileFromS3(user_id + "/product") //fileService.getFilesFromDatabase();
      const files = data.Contents.map((file) => ({
        name: file.Key.split("/").pop(),
        url: `https://akv-interns.s3.ap-south-1.amazonaws.com/${file.Key}`,
      }));
      console.log(files);
      // const urls = files.map((file) => file.url);
      // console.log(urls);
      res.json(files);
    } catch (error) {
      logger.error(error);
      res.status(500).send("Error retrieving files");
    }
  },

  // Download all files route controller
  // downloadAllFiles: async (req, res) => {
  //   try {
  //     const { fileUrls } = req.body;

  //     if (!fileUrls || fileUrls.length === 0) {
  //       return res.status(400).send("No files provided");
  //     }

  //     await fileService.createZipForFiles(fileUrls, res);
  //   } catch (error) {
  //     console.error("Error creating ZIP file:", error);
  //     res.status(500).send("Error creating ZIP file");
  //   }
  // },
};
