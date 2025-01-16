const express = require("express");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const bodyParser = require("body-parser");
const { Model } = require("objection");
const knexConfig = require("./mysql/knexfile");
const knex = require("knex")(knexConfig);
const authRoutes = require("./routes/authRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const inventory = require("./routes/inventory");
const fileRoute = require("./routes/files");
const cartRoute = require("./routes/cart");
const productRoute = require("./routes/product");
const validateToken = require("./middilewares/tokenValidation-middileware");

// Initialize Objection.js with Knex
Model.knex(knex);

const app = express();
app.use(cors());
app.use(fileUpload());
app.use(express.json());

// Define Routes
app.use("/auth", authRoutes);
app.use("/upload", uploadRoutes);
app.use("/inventory", inventory);
app.use("/files", fileRoute);
app.use("/product", productRoute);
app.use("/cart", cartRoute);

app.get("/api/protected-data", validateToken, (req, res) => {
  res.json({ message: "This is protected data, token is valid." });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
