import { Request, Response } from "express";
import { collection } from "../../models/connection";

export default async function getAdmins(request: Request,reply: Response) {
  const users = collection("users");
  const admins = await users.find({ isAdmin: "true" }).toArray();
  reply.status(200).send({ admins });
}
