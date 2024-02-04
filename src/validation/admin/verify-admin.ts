import { Response } from "express";
import { collection } from "../../models/connection";
import { ObjectId } from "mongodb";

export default async function verifyAdmin(
  request: any,
  response: Response,
  next: any
) {
  const admin = request.user;
  const users = collection("users");
  const foundAdmin = await users.findOne({ _id: new ObjectId(admin._id) });

  if (foundAdmin?.isAdmin) {
    next();
  } else {
    return response.send({ message: "access not valid" });
  }
}
