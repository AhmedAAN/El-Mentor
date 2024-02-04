import { Request, Response } from "express";
import { collection } from "../../models/connection";
import handle from "../../core/request-class";
import { ObjectId } from "mongodb";

export async function deleteMentor(request: Request, response: Response) {
  const requestHandeler = handle(request);
  const mentorCollection = collection("users");
  const mentorId = requestHandeler.input("id");
  try {
    const deletedMentor = await mentorCollection.deleteOne({
      _id: new ObjectId(mentorId),
    });
    response.status(200).send({ deletedMentor });
  } catch (err) {
    console.log("Error from delete-mentor controller");
    response.status(500).send("Error deleting mentor");
  }
}
