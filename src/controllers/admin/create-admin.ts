import { Request, Response } from "express";
import handle from "../../core/request-class";
import adminValidation from "../../validation/admin/admin-validation";
export default async function createAdmin(
  request: Request,
  response: Response
) {
  const requestHandler = handle(request);
  const validationResult = await adminValidation(requestHandler);
  if (validationResult === true) {
    response.status(200).send("success");
  } else {
    response.status(404).send(validationResult);
  }
}
