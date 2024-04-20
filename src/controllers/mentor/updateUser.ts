import { Request, Response } from "express";
import { collection } from "../../models/connection";
import handle from "../../core/request-class";
import { ObjectId } from "mongodb";
import { generatePhoto } from "../../utils/generatePhoto";
import deletePhoto from "../../utils/deleteOld";

export default async function updateUser(request: Request, response: Response) {
  const requestHandeler = handle(request);
  const usersCollection = collection("users");
  const studentId = (request as any).user._id;
  const userName = requestHandeler.input("userName");
  const email = requestHandeler.input("email");
  let image: any = request?.files?.image;
  let fullData: any = {};
  const description: string = requestHandeler.input("description");
  const services: string = requestHandeler.input("services");
  const specialization: string = requestHandeler.input("specialization");
  const techStack: any[] = requestHandeler.input("techStack");
  const lvlOfExperience: string = requestHandeler.input("experience");
  const title: string = requestHandeler.input("title");
  const linkedIn: string = requestHandeler.input("linkedin");
  const foundData = await usersCollection.findOne({
    _id: new ObjectId(studentId),
  });
  if (image) {
    image = image.data;
    const result = deletePhoto(foundData?.baseName);
    console.log("result " + result);
    fullData = generatePhoto(image);
  }
  if (userName) {
    fullData.userName = userName;
  }
  if (email) {
    fullData.email = email;
  }
  if (description) {
    fullData.description = description;
  }
  if (services) {
    fullData.services = services;
  }
  if (specialization) {
    fullData.specialization = specialization;
  }
  if (techStack) {
    fullData.techStack = techStack;
  }
  if (lvlOfExperience) {
    fullData.lvlOfExperience = lvlOfExperience;
  }
  if (title) {
    fullData.title = title;
  }
  if (linkedIn) {
    fullData.linkedIn = linkedIn;
  }
  console.log(fullData);
  try {
    const updatedStudent = await usersCollection.updateOne(
      {
        _id: new ObjectId(studentId),
      },
      { $set: fullData }
    );
    response.status(200).send({ fullData });
  } catch (err) {
    console.log("Error from update-student controller");
    response.status(500).send("Error updating student");
  }
}
