import { Response } from "express";
import { collection } from "../../models/connection";
import { ObjectId } from "mongodb";
import handle from "../../core/request-class";
import isEqual from "lodash.isequal";

export default async function verifyAdminOrMentor(
  request: any,
  response: Response,
  next: any
) {
  const admin = request.user;
  const mentor = request.user;
  const users = collection("users");
  const requestHandler = handle(request);
  const mentorId = requestHandler.input("id");
  const foundAdmin = await users.findOne({ _id: new ObjectId(admin._id) });

  /*console.log("adminid=" + foundAdmin?._id + "  ");
  console.log("mentrid=" + mentor._id);
  console.log(mentor._id=== mentorId)*/
  console.log(mentor._id.equals(mentorId)); ///if you would like to know why if is empty uncomment these console log.
  if (foundAdmin?.isAdmin) {
    next();
  } else if (mentor._id == mentorId) {
    next();
  } else {
    return response.send({ message: "access not valid" });
  }
}
