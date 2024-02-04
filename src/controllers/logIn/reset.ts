import handle from "../../core/request-class";
import { collection } from "../../models/connection";
import hash from "../../utils/hashing-pssword";
import { Request, Response } from "express";

export default async function reset(request: Request, res: Response) {
  const requestHandler = handle(request);
  const password: string = requestHandler.input("password");
  const code: string = requestHandler.input("code");
  console.log(code, password);
  if ( !password && !code) {
    return res.send({ error: "all fields are required" });
  }
  const usersCollection = collection("users");
  const user = await usersCollection.findOne({ code: code });

  if (!user) {
    return res.status(404).send({ error: "code not found" });
  }
  
  const newPassword = await hash(password);
  await usersCollection.updateOne(
    { code: code },
    { $set: { password: newPassword } }
  );
  await usersCollection.updateOne({ code: code }, { $unset: { code: code } });

  res.status(200).send({ message: "success" });
}
