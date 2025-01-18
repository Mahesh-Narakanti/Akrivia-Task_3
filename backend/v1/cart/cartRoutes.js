const express = require("express");
const cartController = require("./cartController");
const router = express.Router();

// Routes
router.post("/add", cartController.addToCart);
router.get("/get", cartController.getCart);

module.exports = router;
