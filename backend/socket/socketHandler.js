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

    // Listen for token sent by the client
    socket.on("authenticate", async (token) => {
      try {
        // Verify JWT token
        const decoded = jwt.verify(token, "godisgreat"); // Secret key used to sign JWT

        // Fetch user from the database using the token
        const user = await knex("users").where("id", decoded.id).first();
        console.log(user);
        if (!user) {
          socket.emit("error", "Invalid token");
          return;
        }
        const userColor = getRandomColor();
        // Send confirmation that the user is authenticated
        socket.emit("authenticated", {
          username: user.username,
          color: userColor,
        });

        // Listen for chat messages and associate the username with the message
        socket.on("chatMessage", (msg) => {
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
        socket.emit("error", "Invalid token");
      }
    });
  });
}

module.exports = socketHandler;
