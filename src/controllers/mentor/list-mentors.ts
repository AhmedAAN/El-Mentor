import { Request, Response } from "express";
import { collection } from "../../models/connection";
import handle from "../../core/request-class";
import { ObjectId } from "mongodb";
import { skip } from "node:test";
import {
  averageStars,
  lookupReviews,
  matchMentors,
  projection,
} from "../../helper/mentors/listing";

export async function listMentors(request: Request, response: Response) {
  const requestHandeler = handle(request);
  const mentorsCollection = collection("users");
  try {
    const page = +requestHandeler.input("page") || 1;
    const levelOfExperience = requestHandeler.input("levelOfExperience");
    const specialization = requestHandeler.input("specialization");
    const matchFilter: any = {};
    if (levelOfExperience) {
      matchFilter.levelOfExperience = levelOfExperience;
    }
    if (specialization) {
      matchFilter.specialization = specialization;
    }
    matchFilter.mentor = true;
    const limit = 8;
    const skip = (page - 1) * limit;
    const mentors = await mentorsCollection
      .aggregate([matchMentors, lookupReviews, averageStars, projection])
      .toArray();
    const mentorsData = await mentorsCollection
      .aggregate([
        matchMentors(matchFilter),
        lookupReviews,
        averageStars,
        projection,
        {
          $skip: skip,
        },
        {
          $limit: limit,
        },
      ])
      .toArray();
    const totalMentors = mentors.length;
    const numberOfPages: number = Math.ceil(mentors.length / limit);
    response
      .status(200)
      .send({ mentorsData, page, limit, numberOfPages, totalMentors });
  } catch (err) {
    console.log("Error from list-mentors controller");
    response.status(500).send("Error getting mentors");
  }
}
