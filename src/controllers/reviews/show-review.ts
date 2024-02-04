import { Request, Response } from "express";
import handle from "../../core/request-class";
import { collection } from "../../models/connection";
import { ObjectId } from "mongodb";

export default async function showReview(request: any, response: Response) {
  const requestHandler = handle(request);
  const reviewId = requestHandler.input("reviewId");
  const reviewsCollection = collection("reviews");

  try {
    const review = await reviewsCollection.findOne({
      _id: new ObjectId(reviewId),
    });

    response.status(200).send(review);
  } catch (err) {
    response.status(500).send({ msg: "Error displaying review" });
  }
}
