const express = require("express");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const { Model } = require("objection");
const knexConfig = require("./mysql/knexfile");
const knex = require("knex")(knexConfig);
// const authRoutes = require("./routes/authRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const inventory = require("./routes/inventory");
// const fileRoute = require("./routes/files");
// const cartRoute = require("./routes/cart");
 //const productRoute = require("./routes/product");
const validateToken = require("./middilewares/tokenValidation-middileware");
const userRoute = require("./v1/authorization/userRoute");
const cartRoute = require("./v1/cart/cartRoutes");
const fileRoute = require("./v1/file/fileRoutes");
const inventories=require("./v1/inventory/productRoutes")
// Initialize Objection.js with Knex
Model.knex(knex);

const app = express();
app.use(cors());
app.use(fileUpload());
app.use(express.json());

// Define Routes
app.use("/auth", userRoute);
app.use("/upload",validateToken, uploadRoutes);
app.use("/inventory", validateToken, inventory);
app.use("/inventories", validateToken, inventories);
app.use("/files",validateToken, fileRoute);
app.use("/product",validateToken, inventories);
app.use("/cart",validateToken, cartRoute);

app.get("/api/protected-data", validateToken, (req, res) => {
  res.json({ message: "This is protected data, token is valid." });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
