import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import cors from "cors";

const port = 3000;
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("User connected");
  console.log("id", socket.id);
  socket.emit("welcome", `new Welcome to server, ${socket.id}`);
  socket.broadcast.emit("welcome", socket.id, " joined the server");

  socket.on("privateMessage", ({ otherId, message }) => {
    console.log(otherId);
    console.log(message);
    socket.to(otherId).emit("pvt", message);
  });

  // Broadcast content updates to all clients except the sender
  socket.on("editorContentUpdate", ({ newContent, roomId }) => {
    socket.broadcast.to(roomId).emit("editorContentUpdate", newContent);
  });

  // Broadcast language changes to all clients except the sender
  socket.on("languageChange", (newLanguage) => {
    socket.broadcast.emit("languageChange", newLanguage);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });

  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    console.log("Joined room");
  });
});

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.send("Hello akshat");
});

server.listen(port, () => {
  console.log("server is running on port ", port);
});
