const express = require("express");
const rateLimit = require("express-rate-limit");
const { decryptRequest, encryptResponse } = require('./middilewares/crypto-middileware'); // Import the middleware
const cors = require("cors");
const jwt = require("jsonwebtoken");
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
const inventories = require("./v1/inventory/productRoutes");
const errorHandler = require("./middilewares/errorhandler-middileware");
const http = require("http");
const socketIo = require("socket.io");
// Initialize Objection.js with Knex
Model.knex(knex);

const app = express();
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 2 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
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



function getRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

io.on("connection", (socket) => {
  console.log('A user connected');

  // Listen for token sent by the client
  socket.on('authenticate', async (token) => {
    try {
      // Verify JWT token
      const decoded = jwt.verify(token, 'godisgreat'); // Secret key used to sign JWT

      // Fetch user from the database using the token
      const user = await knex('users').where('id', decoded.id).first();
      console.log(user);
      if (!user) {
        socket.emit('error', 'Invalid token');
        return;
      }
     const userColor = getRandomColor();
      // Send confirmation that the user is authenticated
      socket.emit("authenticated", {
        username: user.username,
        color:userColor,
      });

      // Listen for chat messages and associate the username with the message
      socket.on('chatMessage', (msg) => {
        console.log(`${user.username}: ${msg}`);
        io.emit("chatMessage", {
          username: user.username,
          msg,
          color: userColor,
        });

       socket.broadcast.emit("notification", {
         message: `${user.username} sent a message!`,
       }); // Notification broadcast
      });
    } catch (err) {
      socket.emit('error', 'Invalid token');
    }
  });
});

app.use((err, req, res, next) => {
  console.error(err); // Log error details for debugging

  const statusCode = err.statusCode || 500; // Default to 500 (Internal Server Error)
  const message = err.message || "Something went wrong!";

  // If it's a known error (like validation errors), you can send a custom message
  if (err.name === "ValidationError") {
    res.status(400).json({
      status: "error",
      message: "Invalid input data",
      details: err.errors,
    });
  } else {
    // Send generic error for other types of errors
    res.status(statusCode).json({
      status: "error",
      name: "JsonWebTokenError",
    });
  }
});


const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
