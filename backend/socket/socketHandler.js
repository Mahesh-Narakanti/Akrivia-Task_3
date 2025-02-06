const jwt = require("jsonwebtoken");
const knexConfig = require("../mysql/knexfile");
const knex = require("knex")(knexConfig);
const users = {}; // { userId: { username, color, rooms: [] } }
const rooms = {}; // { roomName: { members: [userId1, userId2] } }

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
        
        if (!user) {
          socket.emit("error", "Invalid token");
          return;
        }

        const userColor = getRandomColor();

        // Store user details
        users[socket.id] = {
          username: user.username,
          color: userColor,
          rooms: [],
          id:user.id,
        };

        // Join the user to their own unique socket room
        socket.join(`/user/${user.id}`);

        // Send all rooms and their members to the client
        io.emit("updateRooms", rooms);

        // Send the list of all online users to the new user
        io.to(socket.id).emit(
          "updateOnlineUsers",
          Object.values(users).map((u) => ({
            username: u.username,
            color: u.color,
            id: u.id,
          }))
        );
        
        io.to(socket.id).emit("userName", user.username);
        // Notify others when a user comes online
        socket.broadcast.emit("userStatus", {
          username: user.username,
          status: "online",
          id:user.id
        });

        // Listen for joining and leaving rooms
        socket.on("joinRoom", (roomName) => {
          if (!rooms[roomName]) {
            rooms[roomName] = { members: [] };
          }

          // Prevent adding the same user to the room more than once
          if (!rooms[roomName].members.includes(socket.id)) {
            rooms[roomName].members.push(socket.id);
            users[socket.id].rooms.push(roomName);

            socket.join(roomName);
            io.to(roomName).emit("roomUpdated", rooms[roomName].members);
            io.emit("updateRooms", rooms);
          } else {
            socket.emit("error", `You are already in room: ${roomName}`);
          }
        });

        socket.on("leaveRoom", (roomName) => {
          const room = rooms[roomName];
          if (room) {
            // Remove user from room members and user's room list
            room.members = room.members.filter((id) => id !== socket.id);
            users[socket.id].rooms = users[socket.id].rooms.filter(
              (room) => room !== roomName
            );

            socket.leave(roomName);
            io.to(roomName).emit("roomUpdated", room.members);
            io.emit("updateRooms", rooms);
          }
        });

        socket.on("createRoom", (roomName) => {
          if (!rooms[roomName]) {
            rooms[roomName] = { members: [socket.id] };
            users[socket.id].rooms.push(roomName);

            socket.join(roomName);
            io.emit("updateRooms", rooms);
            io.to(roomName).emit("roomUpdated", rooms[roomName].members);
          } else {
            socket.emit("error", `Room ${roomName} already exists.`);
          }
        });

        // Listen for private messages from the client
        socket.on("sendPrivateMessage", (recipientId, message) => {
          // Check if the recipient is online
          const recipientSocketId = Object.keys(users).find(
            (id) => users[id].id === recipientId
          );
          if (recipientSocketId) {
            // Send the private message to the recipient
            io.to(recipientSocketId).emit("receivePrivateMessage", {
              username: user.username,
              msg: message,
              color: userColor,
              id:user.id,
            });
          } else {
            socket.emit("error", `User ${recipientId} is not online.`);
          }
        });

        // Listen for group (room) messages from the client
        socket.on("sendGroupMessage", (roomName, message) => {
          if (rooms[roomName] && rooms[roomName].members.includes(socket.id)) {
            io.to(roomName).emit("receiveGroupMessage", {
              username: user.username,
              msg: message,
              color: userColor,
              id:roomName,
            });
          } else {
            socket.emit("error", `You are not in the room: ${roomName}`);
          }
        });

        // Handle file processed notifications
        socket.on("fileProcessed", (fileName, userId) => {
          console.log(`${user.username}'s file ${fileName} was processed`);

          // Send user-specific notification
          io.to(`/user/${userId}`).emit("notification", {
            message: `Your file "${fileName}" has been processed successfully.`,
            status: "success",
          });
        });

        // Handle user disconnection
        socket.on("disconnect", () => {
          const user = users[socket.id];
          if (user) {
            // Remove the user from all rooms they belong to
            user.rooms.forEach((roomName) => {
              const room = rooms[roomName];
              if (room) {
                room.members = room.members.filter((id) => id !== socket.id);
                io.to(roomName).emit("roomUpdated", room.members);
              }
            });

            // Broadcast the user going offline
            socket.broadcast.emit("userStatus", {
              username: user.username,
              status: "offline",
            });

            // Clean up user data
            delete users[socket.id];
            io.emit("updateRooms", rooms);
            io.emit(
              "updateOnlineUsers",
              Object.values(users).map((u) => ({
                username: u.username,
                color: u.color,
                id:u.id
              }))
            );
          }
        });
      } catch (err) {
        socket.emit("error", "Invalid token");
      }
    });
  });
}

module.exports = socketHandler;
