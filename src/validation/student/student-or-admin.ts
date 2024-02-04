import { Response } from "express";
import { collection } from "../../models/connection";
import { ObjectId } from "mongodb";
import handle from "../../core/request-class";

export default async function verifyAdminOrStudent(
  request: any,
  response: Response,
  next: any
) {
  const requestHandeler = handle(request);
  const id = requestHandeler.input("id");
  const admin = request.user;
  const student = request.user;
  const users = collection("users");
  const foundAdmin = await users.findOne({ _id: new ObjectId(admin._id) });
  if (foundAdmin?.isAdmin) {
    next();
  } else if (student._id.toString() == id.toString()) {
    next();
  } else {
    return response.status(200).send({
      message: "access not valid",
    });
  }
  //next();
}
