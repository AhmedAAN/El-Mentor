import { collection } from "../../models/connection";
import hash from "../../utils/hashing-pssword";
import path from "path";
import urlImage from "../../controllers/students/urlImage";
import * as fs from "fs";
import handle from "../../core/request-class";

export default async function valid(request: any) {
  const studentsCollection = collection("users");
  const UserChats = collection("UserChats");
  const Notifications = collection("Notifications");
  const requestHandeler = handle(request);

  const userName = requestHandeler.input("userName");
  const email = requestHandeler.input("email");
  const password = requestHandeler.input("password");
  const confirmPassword = requestHandeler.input("confirmPassword");
  const specialization = requestHandeler.input("specialization");
  const findEmail = await studentsCollection.findOne({ email: email });
  const validRegex =
    /^[a-zA-Z0-9.!#$%^&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9]+)*$/;

  let image: any = request?.files?.image?.data;
  console.log(request?.files?.image?.data); //******** */
  const imageName = Math.random().toString(36).substring(2, 7);
  let myPath: string | null = path.normalize(
    __dirname + `../../../../storage/uploads/${imageName}.png`
  );
  //console.log("myPath from validation ="+myPath);
  //console.log("dirName from validation ="+__dirname);
  let baseName: any = path.basename(myPath);
  let imageUrl: any = urlImage(baseName);
  if (image) {
    fs.writeFile(myPath, image, (err) => {
      if (err) {
        console.log("Error");
      } else {
        console.log("hallo from png");
      }
    });
  } else {
    imageUrl = null;
    baseName = null;
    myPath = null;
  }
  console.log(baseName);
  console.log(confirmPassword);
  if (!email.match(validRegex)) {
    return "Please enter a valid email";
  }
  if (findEmail) {
    return "Email already exists";
  }
  if (password !== confirmPassword || password.length < 8) {
    return "Password is incorrect";
  }
  if (!specialization) {
    return "specialization is required";
  } else {
    const finalPass = await hash(password);
    var result = await studentsCollection.insertOne({
      userName,
      email,
      imageUrl: imageUrl,
      baseName,
      password: finalPass,
      student: true,
      specialization,
    });
    await UserChats.insertOne({
      userID: result.insertedId,
      chats: []
    });
    await Notifications.insertOne({
      receiverId: result.insertedId,
      old: [],
      new: []
    });
    return true;
  }
}
