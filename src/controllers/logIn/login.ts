import bcrypt from "bcrypt";
import { collection } from "../../models/connection";
import handle from "../../core/request-class";
import { Response } from "express";
//import { secretKey } from "../../../config";
import newAccessToken from "../../utils/generate-access-token";
import verifyPassword from "../../validation/users/verify-password";
import { loginValidation } from "../../validation/users/logIn-validation";

export default async function login(request: any, reply: Response) {
  const requestHandler = handle(request);
  const usersCollection = collection("users");
  const { email, password } = requestHandler.only(["email", "password"]);
  console.log(email, password);
  const secretKey = process.env.SECRETKEY ? process.env.SECRETKEY : "";
  if (!loginValidation(email, password)) {
    return reply.send({ error: "email and password are both required" });
  }
  const accessToken = collection("accessToken");
  const user = await usersCollection.findOne({ email: email });

  if (!user) {
    return reply.status(404).send({
      error: "User not found",
    });
  }
  const finalUser = {
    _id: user._id,
    userName: user.userName,
    email: user.email,
  };
  const token = await newAccessToken({ _id: user._id }, secretKey, {
    expiresIn: "10d",
    algorithm: "HS256",
  });
  const finalPassword: string = user.password;
  console.log(finalPassword);
  const passCompare = await verifyPassword(password, finalPassword);
  console.log(passCompare, "  ", password);
  if (passCompare) {
    await accessToken.insertOne({ id: user._id, token: token });
    delete user.password;
    reply.cookie("Authorization", token, { maxAge: 1000 * 60 * 60 * 24 * 5 , sameSite: "none", secure: true}); //five days
    reply.setHeader('Access-Control-Allow-Origin', ['http://127.0.0.1:5500', "http://localhost:5500"]);
    reply.status(200).send({
      user: finalUser,
    });
  } else {
    return reply.status(500).send("failed login");
  }
}
