// errorHandler.js
const errorHandler = (err, req, res, next) => {
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
};

module.exports = errorHandler;
