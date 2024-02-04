import path from "path";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import fileUpload from "express-fileupload";
import dotenv from "dotenv";
dotenv.config();
const app = express();
//using cors to access resources of the browser
app.use(cors());
//for uploading images
app.use(fileUpload());
const myPath = path.join(process.cwd() + "/storage/uploads"); //D:\graduation project\elmentor/storage/uploads

//taking data from frontend
app.use(bodyParser.json());
app.use(express.json());
app.use("/uploads", express.static(myPath));
app.use(express.urlencoded({ extended: true }));
app.use(express.urlencoded());
//listening on port 4000
const port:number = Number(process.env.PORT)||3000;
//console.log("port = "+port)
app.listen(port, () => {
  console.log("listening on port " +port);
});

export default app;
