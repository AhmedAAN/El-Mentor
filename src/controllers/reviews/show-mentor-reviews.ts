import { Request, Response } from "express";
import handle from "../../core/request-class";
import { collection } from "../../models/connection";
import { ObjectId } from "mongodb";

export default async function showMentorsReviews(
  request: any,
  response: Response
) {
  const requestHandler = handle(request);
  const mentorId = requestHandler.input("mentorId");
  const reviewsCollection = collection("reviews");
  const limit = 8;
  const page = +requestHandler.input("page") || 1;
  const skip = (page - 1) * limit;
  console.log(mentorId)
  try {
    const reviews = await reviewsCollection
      .find({
        mentorId:new ObjectId(mentorId),
      })
      .limit(limit)
      .skip(skip)
      .toArray();

    const numberOfPages: number = Math.ceil(reviews.length / limit);

    response
      .status(200)
      .send({ reviews, numberOfPages, limit, page, total: reviews.length });
  } catch (err) {
    response.status(500).send({ msg: "Error displaying reviews" });
  }
}
