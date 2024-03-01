import { Request, Response } from "express";
import { collection } from "../../models/connection";
import handle from "../../core/request-class";
import { ObjectId } from "mongodb";

export default async function logout(request: Request, response: Response) {
  const accessTokenCollection = collection("accessToken");
  const userId = (request as any).user._id;
  console.log(userId)
  if (userId.toString() === userId) {
    try {
      await accessTokenCollection.deleteMany({ _id: new ObjectId(userId) });
      return response.status(200).send({ msg: "success" });
    } catch (err) {
      console.log("error from logout controller " + err);
      response.status(500).send("error");
    }
  }
}
