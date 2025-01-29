const jwt = require("jsonwebtoken");
const knexConfig = require("../mysql/knexfile");
const knex = require("knex")(knexConfig);

function getRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function socketHandler(io) {
  io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("authenticate", async (token) => {
      try {

          const decoded = jwt.verify(token, "godisgreat"); // Secret key used to sign JWT

        const user = await knex("users").where("id", decoded.id).first();
        console.log(user);
        if (!user) {
          socket.emit("error", "Invalid token");
          return;
        }
        const userColor = getRandomColor();

        socket.on("chatMessage", (msg) => {
          console.log(`${user.username}: ${msg}`);
          io.emit("chatMessage", {
            username: user.username,
            msg,
            color: userColor,
          });

          socket.broadcast.emit("notification", {
            message: `${user.username} sent a message!`,
          }); 
        });
      } catch (err) {
        socket.emit("error", "Invalid token");
      }
    });
  });
}

module.exports = socketHandler;
