const express = require("express");
const limiter = require("./middilewares/rateLimiter-middileware");
const { decryptRequest, encryptResponse } = require('./middilewares/crypto-middileware'); // Import the middleware
const cors = require("cors");
const fileUpload = require("express-fileupload");
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
const inventories = require("./v1/inventory/productRoutes");
const http = require("http");
const socketIo = require("socket.io");
const socketHandler = require("./socket/socketHandler");
const errorHandler = require("./middilewares/errorhandler-middileware");

const app = express();
app.use(
  cors()
);
app.use(fileUpload());
app.use(express.json());
app.use(limiter);
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:4200", // Allow this specific origin to connect
    methods: ["GET", "POST","PUT","DELETE"], // Allow these HTTP methods
    allowedHeaders: ["Content-Type"], // Allow these headers
    credentials: true, // Allow credentials (optional)
  },
});

app.use(decryptRequest);   // Decrypt incoming request data
app.use(encryptResponse);  // Encrypt outgoing response data

// Routes
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


socketHandler(io);

app.use(errorHandler);

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
