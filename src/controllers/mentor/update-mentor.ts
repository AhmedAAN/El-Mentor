import { Request, Response } from "express";
import { collection } from "../../models/connection";
import handle from "../../core/request-class";
import { ObjectId } from "mongodb";

export async function updateMentor(request: Request, response: Response) {
  const requestHandeler = handle(request);
  const mentorCollection = collection("users");
  const userId = (request as any).user._id;
  try {
    const updatedUser = await mentorCollection.updateOne(
      {
        _id: new ObjectId(userId),
      },
      { $set: request.body }
    );
    response.status(200).send(updatedUser);
  } catch (err) {
    console.log("Error from update-mentor controller");
    response.status(500).send({ msg: "Error updating user" });
  }
}
