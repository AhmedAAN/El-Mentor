import { Request, Response } from "express";
import { collection } from "../../models/connection";
import handle from "../../core/request-class";
import { ObjectId } from "mongodb";

export async function deleteMentor(request: Request, response: Response) {
  const requestHandeler = handle(request);
  const mentorCollection = collection("users");
  const userId = (request as any).user._id;
  try {
    const deletedUser = await mentorCollection.deleteOne({
      _id: new ObjectId(userId),
    });
    response.status(200).send(deletedUser);
  } catch (err) {
    console.log("Error from delete-mentor controller");
    response.status(500).send({ msg: "Error deleting user" });
  }
}
