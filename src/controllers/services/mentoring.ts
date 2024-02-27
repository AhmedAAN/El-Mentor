import { Request, Response } from "express";
import handle from "../../core/request-class";
import { collection } from "../../models/connection";

export default async function consultation(
  request: Request,
  response: Response
) {
  const requestHandeler = handle(request);
  const lvlOfExperience = requestHandeler.input("levelOfExperience");
  const specialization = requestHandeler.input("specialization");
  const mentorsCollection = collection("users");
  const page = +requestHandeler.input("page") || 1;
  const limit = 8;
  const skip = (page - 1) * limit;
  const filter: any = {};
  if (lvlOfExperience) {
    filter["levelOfExperience"] = lvlOfExperience;
  }
  if (specialization) {
    filter["specialization"] = specialization;
  }
  filter["services"] = { $in: ["mentoring"] };
  filter["mentor"] = true;
  console.log(filter);
  try {
    const mentors = await mentorsCollection.find(filter).limit(limit).skip(skip).toArray();
    const numberOfPages: number = Math.ceil(mentors.length / limit);
    response.status(200).send({mentors, page, limit, numberOfPages, total: mentors.length });
  } catch (err) {
    response.status(500).send({ msg: err });
  }
}
