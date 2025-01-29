require("dotenv").config();

module.exports = {
  client: "mysql2", 
  connection: {
    host: "localhost",
    user: "root",
    password: "Mpkl@9948",
    database: "inventory",
  },
  migrations: {
    directory: "./migrations", 
  },
  seeds: {
    directory: "./seeds",
  },
};
