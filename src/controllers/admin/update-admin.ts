import { ObjectId } from "mongodb";
import { collection } from "../../models/connection";
import handle from "../../core/request-class";
import { Request, Response } from "express";

export default async function updateAdmin(
  request:Request,
  response:Response
) {
  const usersCollection = collection("users");
  const requestHandler = handle(request);
  const adminId = requestHandler.input("adminId");
  try {
    let newAdmin = await usersCollection.updateOne(
      { _id: new ObjectId(adminId) },
      { $set: request.body }
    );
    response.status(200).send({ newAdmin });
  } catch (err) {
    response.status(404).send(err);
  }
}
