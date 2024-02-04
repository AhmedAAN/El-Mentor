import { Request, Response } from "express";
import { collection } from "../../models/connection";
import handle from "../../core/request-class";
import { ObjectId } from "mongodb";

export async function listStudent(request: Request, response: Response) {
  const requestHandeler = handle(request);
  const studentsCollection = collection("users");
  const studentId = requestHandeler.input("id");
  try {
    const student = await studentsCollection.findOne({
      _id: new ObjectId(studentId),
    });
    delete student?.password;
    response.status(200).send({ student });
  } catch (err) {
    console.log("Error from list-student controller");
    response.status(500).send("Error getting student");
  }
}
