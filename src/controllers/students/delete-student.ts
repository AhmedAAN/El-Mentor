import { Request, Response } from "express";
import { collection } from "../../models/connection";
import handle from "../../core/request-class";
import { ObjectId } from "mongodb";

export async function deleteStudent(request: Request, response: Response) {
  const requestHandeler = handle(request);
  const studentsCollection = collection("users");
  const mentorId = (request as any).user._id
  try {
    const deletedStudent = await studentsCollection.deleteOne({
      _id: new ObjectId(mentorId),
    });
    response.status(200).send({ deletedStudent });
  } catch (err) {
    console.log("Error from delete-student controller");
    response.status(500).send("Error deleting student");
  }
}
