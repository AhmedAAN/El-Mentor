import { Request, Response } from "express";
import { collection } from "../../models/connection";
import handle from "../../core/request-class";
import { ObjectId } from "mongodb";

export async function updateMentor(request: Request, response: Response) {
  const requestHandeler = handle(request);
  const mentorCollection = collection("users");
  const mentorId = requestHandeler.input("id");
  try {
    const updatedMentor = await mentorCollection.updateOne(
      {
        _id: new ObjectId(mentorId),
      },
      { $set: request.body }
    );
    response.status(200).send({ updatedMentor });
  } catch (err) {
    console.log("Error from update-mentor controller");
    response.status(500).send("Error updating mentor");
  }
}
