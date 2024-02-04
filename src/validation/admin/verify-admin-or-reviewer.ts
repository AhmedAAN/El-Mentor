import { Response } from "express";
import { collection } from "../../models/connection";
import { ObjectId } from "mongodb";
import handle from "../../core/request-class";

export default async function verifyAdminOrReviewer(
  request: any,
  response: Response,
  next: any
) {
  const admin = request.user;
  const users = collection("users");

  const requestHandler = handle(request);
  const reviewId = requestHandler.input("reviewId");
  const reviewsCollection = collection("reviews");
  const user = request.user;

  const foundAdmin = await users.findOne({ _id: new ObjectId(admin._id) });
  const review: any = await reviewsCollection.findOne({
    _id: new ObjectId(reviewId),
  });

  if (foundAdmin?.isAdmin) {
    next();
  } else if (review.reviewerId.toString() == user._id.toString()) {
    next();
  } else {
    return response.send({ message: "access not valid" });
  }
}
