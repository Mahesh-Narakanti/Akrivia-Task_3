const express = require("express");
const fileController = require("./fileController");
const router = express.Router();

// Routes for file operations
router.post("/", fileController.uploadFile);
//router.post("/add", fileController.addFile);
router.get("/list-files", fileController.listFiles);
// router.post("/download-all", fileController.downloadAllFiles);

module.exports = router;
