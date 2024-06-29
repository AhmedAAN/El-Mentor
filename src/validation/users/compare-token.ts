import { Request, Response } from "express";
import Jwt from "jsonwebtoken";
import { collection } from "../../models/connection";

export default async function verifyToken(req: any, res: Response, next: any) {
  const authHeader = req.cookies;
  if (!authHeader) {
    return res
      .status(403)
      .send({ error: "Invalid authorization, token is required" });
  }
  console.log("Auth=  "+ req.cookies.Authorization)
  const token = authHeader.Authorization;
  const accessToken = collection("accessToken");
  const users = collection("users");

  try {
    const secretKey = process.env.SECRETKEY || "";
    const result = await Jwt.verify(token, secretKey);
   // console.log(result)
    const found = await accessToken.findOne({ token: token });
    if (!found) {
      return res.status(404).send({ error: "not found" });
    }
    //console.log(found);
    req.user = result; //
  } catch (err) {
    res.status(500).send({ error: "Error verifying token" });
  }
  next();
}
