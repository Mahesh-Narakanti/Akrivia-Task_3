const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 7 * 60 * 1000, // 7 minutes
  max: 77, // Limit each IP to 77 requests per windowMs
  message: "Too many requests from this IP, please try again after 7 minutes",
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = limiter;
