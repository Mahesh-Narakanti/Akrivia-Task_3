// Load environment variables from the .env file
require("dotenv").config();

module.exports = {
  client: "mysql2", // MySQL client from environment
  connection: {
    host: "localhost",
    user: "root",
    password: "Mpkl@9948",
    database: "inventory",
  },
  migrations: {
    directory: "./migrations", // Migration folder path
  },
  seeds: {
    directory: "./seeds",
  },
};
