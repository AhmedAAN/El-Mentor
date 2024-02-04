import { Request, Response } from "express";
import handle from "../../core/request-class";
import { collection } from "../../models/connection";
import { ObjectId } from "mongodb";
import verifyAdmin from "../../validation/admin/verify-admin-or-reviewer";

export default async function deleteReview(request: any, response: Response) {
  const requestHandler = handle(request);
  const reviewId = requestHandler.input("reviewId");
  const reviewsCollection = collection("reviews");

  try {
    const review = await reviewsCollection.deleteOne({
      _id: new ObjectId(reviewId),
    });

    response.status(200).send(review);
  } catch (err) {
    response.status(500).send({ msg: "Error deleting review" });
  }
}
