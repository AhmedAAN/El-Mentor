import { Request, Response } from "express";
import { collection } from "../../models/connection";
import handle from "../../core/request-class";
import { ObjectId } from "mongodb";
import { skip } from "node:test";

export async function listMentors(request: Request, response: Response) {
  const requestHandeler = handle(request);
  const mentorsCollection = collection("users");
  try {
    const page = +requestHandeler.input("page") || 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    const mentors = await mentorsCollection
      .find({ mentor: true }, { projection: { password: false } })
      .limit(limit)
      .skip(skip)
      .toArray();
    const numberOfPages: number = Math.ceil(mentors.length / limit);
    response
      .status(200)
      .send({ mentors, page, limit, numberOfPages, total: mentors.length });
  } catch (err) {
    console.log("Error from list-mentors controller");
    response.status(500).send("Error getting mentors");
  }
}
