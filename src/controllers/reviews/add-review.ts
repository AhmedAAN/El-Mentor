import { Request, Response } from "express";
import handle from "../../core/request-class";
import { collection } from "../../models/connection";

export default async function addReview(request: any, response: Response) {
  const requestHandler = handle(request);
  const mentorId = requestHandler.input("mentorId");
  const numOfStars = +requestHandler.input("stars");
  const comment = requestHandler.input("comment");
  const service = requestHandler.input("service");
  const reviewsCollection = collection("reviews");
  const reviewerId = request.user._id;
  console.log(request.user)
  try {
    await reviewsCollection.insertOne({
      mentorId,
      stars:numOfStars,
      comment,
      reviewerId,
      service,
    });
    response.status(200).send({ msg: "inserted review successfully" });
  } catch (err) {
    response.status(500).send({ msg: "Error inserting review" });
  }
}
