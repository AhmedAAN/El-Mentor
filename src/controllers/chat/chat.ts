import { Request, Response } from "express";
import { collection } from "../../models/connection";
import { handler } from "../../server";

export async function notify(request: Request, response: Response) {
  const notifyReturn = await handler.notify(request.body.message, request.body.receiverID) 
  
  response.status(200).send(notifyReturn);
}

export function createRoom(request: Request, response: Response) {
  const roomId = handler.createRoom();
  
  response.status(200).send({roomId});
}

export async function createChat(request: Request, response: Response) {
  try {
    if (!request.body.ID2 || !request.body.ID1) {
      throw new Error('No ID was sent');
    }

    const err = await handler.createChat(request.body.ID1, request.body.ID2);
    if (err!=0) {
      throw err;
    }
  } catch (err) {
    response.status(400).send(err);
  }
}