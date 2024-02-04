import { Request, Response } from "express";
import { collection } from "../../models/connection";
import handle from "../../core/request-class";
import { ObjectId } from "mongodb";

export async function listStudents(request: Request, response: Response) {
  const requestHandeler = handle(request);
  const studentsCollection = collection("users");
  try {
    const students = await studentsCollection
      .find({ student: true }, { projection: { password: false } })
      .toArray();
    response.status(200).send({ students });
  } catch (err) {
    console.log("Error from list-students controller");
    response.status(500).send("Error getting students");
  }
}
