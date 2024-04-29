const express = require("express");
const dotenv = require("dotenv");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const dbConnect = require("./config/dbConnect");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const { Socket } = require("socket.io");

const app = express();
dotenv.config();
app.use(express.json());
dbConnect();
const PORT = process.env.PORT || 5000;
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);
app.use(notFound);
app.use(errorHandler);
const server = app.listen(PORT, console.log(`Running at ${PORT}`));

app.get("/", (req, res) => {
  res.send("Api is running");
});

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:3000",
  },
});

io.on("connection", (socket) => {
  console.log("Connected to socket.io");

  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connection");
  });

  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("join chat", (roomId) => {
    socket.join(roomId);
  });
  socket.on("new message", (messageData) => {
    var chat = messageData.chat;
    if (!chat.users) return console.log("chat.users is not defined");
    chat.users.forEach((user) => {
      if (user._id === messageData.sender._id) return;
      socket.in(user._id).emit("message recieved", messageData);
    });
  });
});
