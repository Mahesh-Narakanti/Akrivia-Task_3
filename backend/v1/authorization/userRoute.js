const express = require("express");
const userController = require("./userController"); // Relative import
const router = express.Router();


router.post("/signup", userController.signup);


router.post("/login", userController.login);

router.get("/user", userController.getUser);

router.post("/pic", userController.updateProfilePic);

router.post("/refresh-token", userController.refreshToken)

router.get("/getUsers", userController.getUsers);

router.put("/editUser", userController.editUser);
module.exports = router;
