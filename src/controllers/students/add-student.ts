import { Request, Response } from "express";
import { collection } from "../../models/connection";
import valid from "../../validation/student/valid";

//import validation from "../../validation/student/student-validation";
export async function addStudent(request: Request, response: Response) {
  const studentsCollection = collection("users");
  //mentor input
  const validationReasult = await valid(request);
  if (validationReasult == true) {
    return response.status(200).send("student added successfully");
  }
  response.status(200).send(validationReasult);
}
