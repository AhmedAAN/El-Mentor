import { ObjectId } from "mongodb";
import { collection } from "../../models/connection";
import handle from "../../core/request-class";
import { Request, Response } from "express";

export default async function deleteAdmin(
  request:Request,
  response:Response
) {
  const users = collection("users");
  const requestHandler = handle(request);
  const adminId = requestHandler.input("adminId");
  const deleted = await users.deleteOne({ _id: new ObjectId(adminId) });
  response.send({ deleted });
}
