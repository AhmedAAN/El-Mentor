import { collection } from "../../models/connection";
import hash from "../../utils/hashing-pssword";
import path from "path";
import urlImage from "../../controllers/students/urlImage";
import fs from "fs";

export default async function validation(requestHandeler: any, request: any) {
  const mentorsCollection = collection("users");
  const UserChats = collection("UserChats");
  const Notifications = collection("Notifications");

  const userName = requestHandeler.input("userName");
  const email = requestHandeler.input("email");
  const password = requestHandeler.input("password");
  const confirmPassword = requestHandeler.input("confirmPassword");
  let image: any = request?.files?.image?.data;
  const description: string = requestHandeler.input("description");
  const services: string = requestHandeler.input("services");
  const specialization: string = requestHandeler.input("specialization");
  const techStack: any[] = requestHandeler.input("techStack");
  const lvlOfExperience: string = requestHandeler.input("experience");
  const title: string = requestHandeler.input("title");
  const linkedIn: string = requestHandeler.input("linkedin");
  const findEmail = await mentorsCollection.findOne({ email: email });
  const validRegex =
    /^[a-zA-Z0-9.!#$%^&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9]+)*$/;
  const imageName = Math.random().toString(36).substring(2, 7);
  let myPath: string | null = path.normalize(
    __dirname + `../../../../storage/uploads/${imageName}.png`
  );
  //console.log("myPath from validation ="+myPath);
  //console.log("dirName from validation ="+__dirname);
  console.log(image)
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
  if (!email.match(validRegex)) {
    return "Please enter a valid email";
  } else if (findEmail) {
    return "Email already exists";
  } else if (password !== confirmPassword && password.length < 8) {
    return "Password is incorrect";
  } else if (!description) {
    return "description is required";
  } else if (!services) {
    return " services is required";
  } else if (!specialization ) {
    return " specialization is required";
  } else if (!lvlOfExperience) {
    return " level of experience is required";
  } else if (!linkedIn) {
    return "linkedin is required";
  } else {
    const finalPass = await hash(password);

    console.log(image);

    var result = await mentorsCollection.insertOne({
      userName,
      email,
      password: finalPass,
      baseName,
      imageUrl: imageUrl,
      description,
      services,
      specialization,
      techStack,
      levelOfExperience: lvlOfExperience,
      professionalTitle: title,
      linkedin: linkedIn,
      mentor: true,
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
