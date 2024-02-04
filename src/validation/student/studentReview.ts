import { Request, Response } from "express";
import handle from "../../core/request-class";
import { collection } from "../../models/connection";
import { ObjectId } from "mongodb";

export default async function studentReview(request: any, response: Response,next:any) {
  const requestHandler = handle(request);
  const reviewId = requestHandler.input("reviewId");
  const reviewsCollection = collection("reviews");
  const user = request.user;

  const review: any = await reviewsCollection.findOne({
    _id: new ObjectId(reviewId),
  });
  if (review.reviewerId.toString() !== user._id.toString()) {
    return response.status(200).send({ msg: "Not valid" });
  }
  next()
}
