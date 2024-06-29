import { Request, Response } from "express";
import { collection } from "../../models/connection";
import handle from "../../core/request-class";
import { ObjectId } from "mongodb";
import validation from "../../validation/mentor/sign-mentor";

export async function addMentor(request: Request, response: Response) {
  const requestHandeler = handle(request);
  const mentorsCollection = collection("users");
  //mentor input
  const validationReasult = await validation(requestHandeler,request);
  if (validationReasult == true) {
    return response.status(200).send({msg:"mentor added successfully"});
  }
  response.status(200).send({msg:validationReasult});
}
