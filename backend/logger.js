const winston = require("winston");

// Define log levels and transports
const logger = winston.createLogger({
  level: "info", // Set the default log level (info, debug, error, etc.)
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level}: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    new winston.transports.File({ filename: "logs/app.log" }),
  ],
});

module.exports = logger;
