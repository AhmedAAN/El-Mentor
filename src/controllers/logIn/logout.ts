import { Request, Response } from "express";
import { collection } from "../../models/connection";
import handle from "../../core/request-class";
import { ObjectId } from "mongodb";

export default async function logout(request: Request, response: Response) {
  const accessTokenCollection = collection("accessToken");
  const requestHandeler = handle(request);
  const id = requestHandeler.input("id");
  const userId = (request as any).user;
console.log(userId)
  if (userId.toString() == id) {
    try {
      await accessTokenCollection.deleteMany({ _id: new ObjectId(id) });
      return response.status(200).send({ msg: "success" });
    } catch (err) {
      console.log("error from logout controller " + err);
      response.status(500).send("error");
    }
  }
}
