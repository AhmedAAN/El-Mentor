import { Request, Response } from "express";
import Jwt from "jsonwebtoken";
import crypto from "crypto";
import { secretKey } from "../../../config";
import { collection } from "../../models/connection";

export default async function verifyToken(req: any, res: Response, next: any) {
  const authHeader: string =
    req.headers["Authorization"] || req.headers["authorization"];
  if (!authHeader) {
    return res
      .status(403)
      .send({ error: "Invalid authorization, token is required" });
  }

  if (!authHeader.startsWith("Bearer ")) {
    return res
      .status(403)
      .send({ error: "Invalid authorization, token is required" });
  }

  const token = authHeader.split(" ")[1];
  const accessToken = collection("accessToken");
  const users = collection("users");

  try {
    await Jwt.verify(token, secretKey);
    const found = await accessToken.findOne({ token: token });
    if (!found) {
      return res.status(404).send({ error: "not found" });
    }

    const user = await users.findOne({ _id: found.id });
    req.user = user;//
  } catch (err) {
    res.status(500).send({ error: "Error verifying token" });
  }
  next();
}
