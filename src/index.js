import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";
import authRoute from "./routes/auth.routes.js";
import userRoute from "./routes/user.routes.js";
import profileRoute from "./routes/profile.routes.js";
import postRoute from "./routes/post.routes.js";
const app = express();
const port = process.env.PORT || 4000;
// guarda los usuarios online, queda implementar una mejor forma de administrarlo
let listUsers = [];

// Manejo de cors, peticiones y datos de express js
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
    optionsSuccessStatus: 200,
  }),
);
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false, limit: "10mb" }));
app.use(express.json({ limit: "10mb" }));

// Cookies
app.use(cookieParser());

// Rutas
app.get(["/", "/api"], (req, res) => {
  res.status(200).json({
    message: "Server Ecos",
  });
});
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/posts", postRoute);
app.use("/api/profile", profileRoute);
app.use((req, res) => {
  res.status(404).json({ message: "Ruta no encontrada" });
});

const server = app.listen(port, () =>
  console.log(`Servidor conectado, puerto: ${port}`),
);

// Socket io
const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: [process.env.CLIENT_URL, process.env.DEV_URL],
  },
});

io.on("connection", (socket) => {
  console.log("Un cliente se ha conectado:", socket.id);

  socket.on("connected", (username) => {
    if (!listUsers.find((e) => e === username) && username !== "random") {
      listUsers.push(username);
    }
    io.sockets.emit("usersOnline", listUsers);
    console.log(listUsers);
  });

  socket.on("logout", (username) => {
    listUsers = listUsers.filter((e) => e !== username);
    io.sockets.emit("usersOnline", listUsers);
  });

  socket.on("disconnect", () => {
    console.log(`user disconnected ${socket.id}`);
  });
});

// Arranque del servidor y conexión a mongodb
const connectMongo = async () => {
  if (
    mongoose.connection.readyState === 1 ||
    mongoose.connection.readyState === 2
  ) {
    console.log("MongoDB");
    return;
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Conectado a MongoDB");
  } catch (error) {
    console.error("MongoDB Error: " + error);
  }
  mongoose.set("strictQuery", false);
};

await connectMongo();
