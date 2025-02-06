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
const importFile = require("./routes/import");
const validateToken = require("./middilewares/tokenValidation-middileware");
const chekRole = require("./middilewares/checkRole");
const userRoute = require("./v1/authorization/userRoute");
const cartRoute = require("./v1/cart/cartRoutes");
const fileRoute = require("./v1/file/fileRoutes");
const inventories = require("./v1/inventory/productRoutes");
const http = require("http");
const socketIo = require("socket.io");
const socketHandler = require("./socket/socketHandler");
const errorHandler = require("./middilewares/errorhandler-middileware");
const startCronJob = require("./routes/cronJob");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const mailer = require("./v1/smtp/mail");
const checkRole = require("./middilewares/checkRole");
const checkRoleAndPermission = require("./middilewares/checkRoleAndPermission");

const app = express();


// Swagger configuration
const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: "API Documentation",
      description: "API documentation for Task3",
      version: "1.0.0",
      contact: {
        name: "Narakanti Mahesh",
        email: "maheshakrivia@gmail.com",
      },
    },
    servers: [
      {
        url: "http://localhost:3000", // Your API server URL
      },
    ],
  },
  apis: [
    "./api-documentation/auth.yml",
    "./api-documentation/product.yml",
    "./api-documentation/cart.yml",
    "./api-documentation/file.yml",
  ], // Path to the API docs
};

// Initialize Swagger-jsdoc
const swaggerDocs = swaggerJsdoc(swaggerOptions);

// Serve Swagger UI

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
    methods: ["GET", "POST","PUT","DELETE"], 
    allowedHeaders: ["Content-Type"], 
    credentials: true,
  },
});

app.use(decryptRequest);   // Decrypt incoming request data
app.use(encryptResponse);  // Encrypt outgoing response data

// Routes

app.use("/auth", userRoute);
app.use("/upload",validateToken, uploadRoutes);
app.use("/inventory", validateToken, inventory);
// app.use("/inventories", validateToken,checkRole(2), inventories);
// app.use("/file", validateToken, checkRole(1), importFile);
app.use("/inventories", validateToken, checkRoleAndPermission, inventories);
app.use("/file", validateToken, checkRoleAndPermission, importFile);
app.use("/files",validateToken, fileRoute);
app.use("/product", validateToken, checkRoleAndPermission, inventories);
app.use("/cart",validateToken,checkRoleAndPermission, cartRoute);
app.use("/mail", mailer);

app.get("/api/protected-data", validateToken, (req, res) => {
  res.json({ message: "This is protected data, token is valid." });
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

socketHandler(io);
startCronJob(io);

app.use(errorHandler);

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
