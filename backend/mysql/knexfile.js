module.exports = {
  client: "mysql2", // MySQL as the database
  connection: {
    host: "localhost",
    user: "root",
    password: "Mpkl@9948",
    database: "task3",
  },
  migrations: {
      
    directory: "./migrations",// Folder where your migration files will be stored
  },
};
