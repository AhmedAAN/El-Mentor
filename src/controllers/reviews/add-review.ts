import { Request, Response } from "express";
import handle from "../../core/request-class";
import { collection } from "../../models/connection";
import { ObjectId } from "mongodb";

export default async function addReview(request: any, response: Response) {
  const requestHandler = handle(request);
  const mentorId = requestHandler.input("mentorId");
  const numOfStars = +requestHandler.input("stars");
  const comment = requestHandler.input("comment");
  const service = requestHandler.input("service");
  const reviewsCollection = collection("reviews");
  const reviewerId = request.user;
  const users = collection("users");
  const user = await users.findOne({ _id: new ObjectId(reviewerId) });
  const reviewerName=user?.userName
  console.log(request.user);
  console.log(user?.userName);
  if (numOfStars > 5 || numOfStars < 0) {
    return response.send({ msg: "Invalid number of stars" });
  }
  try {
    await reviewsCollection.insertOne({
      mentorId: new ObjectId(mentorId),
      stars: numOfStars,
      comment,
      reviewerId: new ObjectId(reviewerId),
      reviewerName,
      service,
    });
    response.status(200).send({ msg: "inserted review successfully" });
  } catch (err) {
    response.status(500).send({ msg: "Error inserting review" });
  }
}
