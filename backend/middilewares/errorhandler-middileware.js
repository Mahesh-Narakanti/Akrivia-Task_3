const errorHandler = (err, req, res, next) => {
  console.error(err); 

  const statusCode = err.statusCode || 500; 
  const message = err.message || "Something went wrong!";

  if (err.name === "ValidationError") {
    res.status(400).json({
      status: "error",
      message: "Invalid input data",
      details: err.errors,
    });
  } else {
    res.status(statusCode).json({
      status: "error",
    });
  }
};

module.exports = errorHandler;
