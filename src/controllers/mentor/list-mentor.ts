import { Request, Response } from "express";
import { collection } from "../../models/connection";
import handle from "../../core/request-class";
import { ObjectId } from "mongodb";

export async function listMentor(request: Request, response: Response) {
  const requestHandeler = handle(request);
  const mentorCollection = collection("users");
  const mentorId = requestHandeler.input("id");
  try {
    const mentor = await mentorCollection.findOne({
      _id: new ObjectId(mentorId),
    });
    delete mentor?.password;
    response.status(200).send({ mentor });
  } catch (err) {
    console.log("Error from list-mentor controller");
    response.status(500).send("Error getting mentor");
  }
}
