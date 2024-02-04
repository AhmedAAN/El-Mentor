import { Request, Response } from "express";
import { collection } from "../../models/connection";
import handle from "../../core/request-class";
import { ObjectId } from "mongodb";

export async function updateStudent(request: Request, response: Response) {
  const requestHandeler = handle(request);
  const studentsCollection = collection("users");
  const studentId = requestHandeler.input("id");
  try {
    const updatedStudent = await studentsCollection.updateOne(
      {
        _id: new ObjectId(studentId),
      },
      { $set: request.body }
    );
    response.status(200).send({ updatedStudent });
  } catch (err) {
    console.log("Error from update-student controller");
    response.status(500).send("Error updating student");
  }
}
