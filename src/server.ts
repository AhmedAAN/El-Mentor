import path from "path";
//import express from "express";
import express from "express";
import { createServer } from "http";
import bodyParser from "body-parser";
import cors from "cors";
import fileUpload from "express-fileupload";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import socketHandler from "./socket-handler/socket-handler";
dotenv.config();
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: true, // Allow requests from this origin
    methods: ["GET", "POST", "DELETE"], // Allow these HTTP methods
    credentials: true 
  }
});

const handler = socketHandler(io);
//using cors to access resources of the browser
app.use(cors({
  origin: true, // Allow requests from this origin
  methods: ['GET', 'POST', 'DELETE'], // Allow these HTTP methods
  credentials: true
}));
//for uploading images
app.use(fileUpload());
const myPath = path.join(process.cwd() + "/storage/uploads"); //D:\graduation project\elmentor/storage/uploads
//using cookie parser for token
app.use(cookieParser());
//taking data from frontend
app.use(bodyParser.json());
app.use(express.json());
app.use("/uploads", express.static(myPath));
app.use(express.urlencoded({ extended: true }));
app.use(express.urlencoded());
//listening on port 4000
const port: number = Number(process.env.PORT) || 3000;
//console.log("port = "+port)
httpServer.listen(port, () => {
  console.log("listening on port " + port);
});

export default app;
