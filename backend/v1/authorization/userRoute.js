const express = require("express");
const userController = require("./userController"); // Relative import
const router = express.Router();

// Routes
router.post("/signup", userController.signup);
router.post("/login", userController.login);
router.get("/user", userController.getUser);
router.post("/pic", userController.updateProfilePic);
router.post("/refresh-token",userController.refreshToken)

module.exports = router;
