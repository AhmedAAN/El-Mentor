import { Request, Response } from "express";
import handle from "../../core/request-class";
import { collection } from "../../models/connection";
import { ObjectId } from "mongodb";
import studentReview from "../../validation/student/studentReview";

export default async function updateReview(request: any, response: Response) {
  const requestHandler = handle(request);
  const reviewId = requestHandler.input("reviewId");
  const reviewsCollection = collection("reviews");

  try {
    const review = await reviewsCollection.updateOne(
      {
        _id: new ObjectId(reviewId),
      },
      { $set: request.body }
    );

    response.status(200).send(review);
  } catch (err) {
    response.status(500).send({ msg: "Error updating review" });
  }
}
