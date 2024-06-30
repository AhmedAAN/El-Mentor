import { Request, Response } from "express";
import { collection } from "../../models/connection";
import { handler } from "../../server";
import { ObjectId } from "mongodb";

const Notifications = collection("Notifications");

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

export async function getNotifications(request: Request, response: Response) {
  try {
    const ID = request.params.userID;
    if (!ID) {
      throw new Error('No ID was sent');
    }

    const receiverId = new ObjectId(ID)

    const notifications = await Notifications.findOne({ receiverId: receiverId });
      if (!notifications) {
        throw new Error('Notifications not found');
    };
    
    response.status(200).send(notifications);

    Notifications.updateOne(
        { receiverId: receiverId },
        {
          $push: { old: { $each: notifications.new } },
          $set: { new: [] }
        }
      );
  } catch (err) {
    console.log(err)
    response.status(400).send(err);
  }
}