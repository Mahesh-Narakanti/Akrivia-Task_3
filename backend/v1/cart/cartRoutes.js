const express = require("express");
const cartController = require("./cartController");
const router = express.Router();

// Routes
router.post("/add", cartController.addToCart);
router.get("/get", cartController.getCart);
router.put("/del/:cart_id", cartController.deleteItem);
router.post("/adjust-quantity", cartController.adjustQuantity);


module.exports = router;
