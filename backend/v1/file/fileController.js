const fileService = require("./fileService");
const logger = require("../../logger");

module.exports = {
  // Upload file route controller
  uploadFile: async (req, res) => {
    try {
      const fileContent = Buffer.from(
        req.files.uploadedFileName.data,
        "binary"
      );
      const fileURL = await fileService.uploadToS3(
        fileContent,
        req.files.uploadedFileName.name
      );

      res.json({ fileURL });
    } catch (error) {
      logger.error(error);
      res.status(500).send("Error uploading file");
    }
  },

  // Add file URL to the database route controller
  addFile: async (req, res) => {
    try {
      const { fileURL } = req.body;

      if (!fileURL) {
        return res.status(400).json({ message: "fileURL is required" });
      }

      const fileId = await fileService.addFileToDatabase(fileURL);

      res.status(201).json({
        message: "File added successfully",
        fileId,
      });
    } catch (error) {
      logger.error(error);
      res.status(500).send("Error adding file");
    }
  },

  // List files route controller
  listFiles: async (req, res) => {
    try {
      const files = await fileService.getFilesFromDatabase();
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
