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
  const filter: any = {};
  if (lvlOfExperience) {
    filter["levelOfExperience"] = lvlOfExperience;
  }
  if (specialization) {
    filter["specialization"] = specialization;
  }
  filter["services"] = { $in: ["mockInterview"] };
  filter["mentor"] = true;
  console.log(filter);
  try {
    const mentors = await mentorsCollection.find(filter).toArray();
    response.status(200).send(mentors);
  } catch (err) {
    response.status(500).send({ msg: err });
  }
}
