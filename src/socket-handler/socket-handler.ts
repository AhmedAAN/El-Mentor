import { Server, Socket } from 'socket.io';
import { collection } from "../models/connection";
import { ObjectId } from "mongodb";
import { emit } from 'node:process';
import Jwt from "jsonwebtoken";
var cookie = require("cookie")


const Chats = collection("Chats");
const Users = collection("users");
const UserChats = collection("UserChats");
const Notifications = collection("Notifications");

type ConnectedUsers = {
    [userID: string]: string;
  }

const connectedUsers: ConnectedUsers = {};


export default function socketHandler(io: Server) {

  async function notify(message:string, ID: any) {
    
    try {
      const receiverId = new ObjectId(ID)
      if (!receiverId) {
        throw new Error('Receiver ID is wrong');
      };
      const receiverSocketId = connectedUsers[receiverId.toString()]

      var socket
      if (receiverSocketId) {
        socket = io.sockets.sockets.get(receiverSocketId)
      }
      else {
        socket = null
      }
  
      
      const notifications = await Notifications.findOne({ receiverId: receiverId });
      if (!notifications) {
        throw new Error('Notifications not found');
      };
      const notification = {
        message: message,
        time: new Date()

      }

      if (socket) {
        await Notifications.updateOne(
          { receiverId: receiverId },
          {
            $push: { old: notification }
          }
        );
        socket.emit('notification', message);
      } else {
        await Notifications.updateOne(
          { receiverId: receiverId },
          {
            $push: { new: notification }
          }
        );
      }

      return ({success: "Notification sent successfully"})
    }
    catch(err){
      console.log(err);
      return ({error: err})
    }

    
  }
  function createRoom() {
    do {
      var roomID = Math.random()
      .toString()
      .substring(2, 11)
      .replace(/(.{3})/g,"$1-")
      .substring(0, 11);
    
      var room = io.sockets.adapter.rooms.get(roomID) as Set<string> | undefined;
    }
    while (room);
    return (roomID)
  }
  async function createChat(ID1: any, ID2: any) {

    try{
      const receiver = await Users.findOne({ _id: new ObjectId(ID1) })
      const sender = await Users.findOne({ _id: new ObjectId(ID2) })

      if (!receiver || !sender) {
        throw new Error('Receiver or sender not found');
      }
      var result = await Chats.insertOne({
        users: [
          { user: receiver._id, userName: receiver.userName, image: receiver.imageUrl },
          { user: sender._id, userName: sender.userName, image: sender.imageUrl }
        ],
        messages: [],
        lastMessage: {receiver: receiver._id, text: `${sender.userName} created a new chat`},
        lastUsage: new Date()
      });

      const chat = await Chats.findOne({ _id: result.insertedId })

      if (!chat) {
        throw new Error('Chat not found');
      }

      const senderUpdate: any = {
        $push: {
          chats: {
            chatID: chat?._id,
            receiver: {
              userName: receiver.userName,
              image: receiver.imageUrl
            }
           }
         }
      };

      const receiverUpdate: any = {
        $push: {
          chats: {
            chatID: chat?._id,
            receiver: {
              userName: sender.userName,
              image: sender.imageUrl
            }
           }
         }
      };

      await UserChats.findOneAndUpdate({ userID: sender?._id }, senderUpdate);
      await UserChats.findOneAndUpdate({ userID: receiver?._id }, receiverUpdate);

      const receiverSocketId = connectedUsers[(receiver._id).toString()];
      const senderSocketId = connectedUsers[(sender._id).toString()];

      const receiverSocket= io.sockets.sockets.get(receiverSocketId)
      const senderSocket= io.sockets.sockets.get(senderSocketId)

      if (receiverSocket) {
        receiverSocket.emit('chat created', chat);
      }
      if (senderSocket) {
        senderSocket.emit('chat created', chat);
      }
      return(0)
    }
    catch(err){
      return(err);
    }
  };
  io.on('connection', (socket: Socket) => {
    try {
      const cookies: string = socket.handshake.headers.cookie || "";
      const jwt = cookie.parse(cookies).Authorization;
      const secretKey = process.env.SECRETKEY || "";
      const ID = Jwt.verify(jwt, secretKey);
      if (typeof (ID) != 'string') {
        var userID = ID._id
      
      }

  
      if (userID) {
        connectedUsers[userID] = socket.id
        socket.broadcast.emit("online", { userID: userID })
        console.log(`User ${userID} connected`);
        console.log(connectedUsers)
      }

      // Get chats
      socket.on('get chats', async (page: any, callback) => {
        try {
          const limit = 20;
          const skip = (page - 1) * limit;

          const userchats = await UserChats.findOne({ userID: new ObjectId(userID) })

          if (!userchats) {
            throw new Error('No user chats found');
          }
        
          const chatIDs = userchats.chats.map((chat: { chatID: any; }) => chat.chatID);
          const chats = await Chats.find({ _id: { $in: chatIDs } },
            { projection: { messages: false } })
            .sort({ lastUsage: -1 })
            .skip(skip)
            .limit(limit)
            .toArray();

          callback(chats);
          for (const chat of chats) {
            const chatID = chat._id;
            const ID = new ObjectId(userID);
            await Chats.updateOne(
              { _id: chatID, 'messages.sender': { $ne: ID }, 'messages.received.done': false },
              { $set: { 'messages.$[elem].received.done': true } },
              { arrayFilters: [{ 'elem.sender': ID, 'elem.received.done': false }] }
            );
          }
        }
        catch (err: any) {
          callback({ error: err.message });
        }
      })

      // Listen for chat messages
      socket.on('message', async ({ chatID, msg }) => {
        try {
          let currentTime = new Date();
          let user_id = new ObjectId(userID);
          let chat_id = new ObjectId(chatID);

          const chat = await Chats.findOne({ _id: chat_id });

          if (!chat) {
            throw new Error('Chat not found');
          };
        
          const users = chat.users;

          const receivers = [];

          for (let user of users) {
            if (!(user.user).equals(user_id)) {
              receivers.push(user);
            }
          }

          if (receivers.length < 1) {
            throw new Error('Receivers not found');
          }

          const message = {
            sender: user_id,
            received: {
              done: false,
              time: currentTime
            },
            read: {
              done: false,
              time: currentTime
            },
            time: currentTime,
            text: msg
          }

          const lastMessage = {
            sender: user_id,
            text: msg
          }

          const messagePacket = {
            chatID: chat_id,
            message: message
          }

          const result = await Chats.updateOne(
            { _id: chat_id },
            {
              $push: { messages: message },
              $set: {
                lastUsage: currentTime,
                lastMessage: lastMessage
              }
            }
          );

          if (result.modifiedCount === 0) {
            throw new Error('Message not added');
          };

          for (let receiver of receivers) {
            let receiverSocketId = connectedUsers[(receiver.user).toString()];
            if (receiverSocketId) {
              io.to(receiverSocketId).emit('message', { message: messagePacket });
            }
          }
          socket.emit("message", { message: messagePacket })
        }
        catch (err) {
          socket.emit("message", { error: err })
        }
      });

      // Get Messages
      socket.on('get messages', async (chatID, page, newMessages, callback) => {
        try {
          const limit = 20;
          const skip = ((page - 1) * limit) + newMessages;
          const messages = await Chats.aggregate([
            { $match: { _id: new ObjectId(chatID) } },
            { $project: { messages: 1, _id: 0 } },
            { $unwind: "$messages" },
            { $sort: { "messages.time": -1 } }
          ])
          .skip(skip)
          .limit(limit)
          .toArray();

          const messagesArray = messages.map(({ messages }) => messages)

          const users = await Chats.findOne({ _id: new ObjectId(chatID) }, { projection: { _id: 0, users: 1 } })
        

          let packet;
          for (let user of users?.users) {
            if (!user.user.equals(new ObjectId(userID)) ) {
              packet = user;
            }
          }
          packet.messages = messagesArray;

          callback(packet);
          const ID = new ObjectId(userID);
          await Chats.updateOne(
            { _id: new ObjectId(chatID), 'messages.sender': { $ne: ID }, 'messages.read.done': false },
            { $set: { 'messages.$[elem].read.done': true } },
            { arrayFilters: [{ 'elem.sender': ID, 'elem.read.done': false }] }
          );
      }
      catch (err: any) {
        callback({error: err.message});
      }
    })

    // Handle Typing
    socket.on('typing', async ({chatID})=> {
      let user_id = new ObjectId(userID);
      let chat_id = new ObjectId(chatID);

      const chat = await Chats.findOne({ _id: chat_id });
        
      if (!chat) {
        throw new Error('Chat not found');
      };
        
      const users = chat.users;

      const receivers = [];

      for (let user of users) {
        if(!(user.user).equals(user_id)) {
          receivers.push(user);
        }
      }

      if (receivers.length < 1) {
        throw new Error('Receivers not found');
      }

      for (let receiver of receivers) {
          let receiverSocketId = connectedUsers[(receiver.user).toString()];
          if (receiverSocketId) {
            io.to(receiverSocketId).emit('typing', {chatID, userID});
          }
        }
    });

    socket.on('typing done', async ({chatID})=> {
      let user_id = new ObjectId(userID);
      let chat_id = new ObjectId(chatID);

      const chat = await Chats.findOne({ _id: chat_id });
        
      if (!chat) {
        throw new Error('Chat not found');
      };
        
      const users = chat.users;

      const receivers = [];

      for (let user of users) {
        if(!(user.user).equals(user_id)) {
          receivers.push(user);
        }
      }

      if (receivers.length < 1) {
        throw new Error('Receivers not found');
      }

      for (let receiver of receivers) {
          let receiverSocketId = connectedUsers[(receiver.user).toString()];
          if (receiverSocketId) {
            io.to(receiverSocketId).emit('typing done', {chatID, userID});
          }
        }
    });

    // Handle searching
    socket.on('searching', async (string: string, callback) => {
      
      let user_id = new ObjectId(userID);

      try {

      const pipeline = [
      { $match: { userID: user_id } }, // Match the document with the given userID
      { $unwind: '$chats' }, // Unwind the chats array
      { $match: { 'chats.receiver.userName': { $regex: string, $options: 'i' } } }, // Match receiver.userName with the given text, case insensitive
      { $replaceRoot: { newRoot: '$chats' } } // Group the results back into an array
      ];

      const result = await UserChats.aggregate(pipeline).toArray();
      const chatIDs = result.map(chat => chat.chatID);
      const chats = await Chats.find({ _id: { $in: chatIDs } },
            { projection: { messages: false } })
            .sort({ lastUsage: -1 })
            .toArray();

      callback(chats);
      }
      catch (err: any) {
        console.log(err)
          callback({ error: "No Results" });
        }
    })

    // Handle rooms
    /*
    socket.on('create room', ()=> {
      const roomID = createRoom()
      socket.emit('create room', {roomID});
    })
    */

    /* socket.on('join room', (roomID) => {
      socket.join(roomID);
      var room = io.sockets.adapter.rooms.get(roomID) as Set<string> | undefined;
      if(room) {
        console.log(roomID)
        socket.emit('join room', {room: [...room]});
      }      
    });
    */
    socket.on('join', (roomId: string) => {
      const roomClients = io.sockets.adapter.rooms.get(roomId) || new Set<string>();
    const numberOfClients = roomClients.size;
  
  
      // These events are emitted only to the sender socket.
      if (numberOfClients == 0) {
        console.log(`Creating room ${roomId} and emitting room_created socket event`)
        socket.join(roomId)
        socket.emit('room_created', roomId)
      } else if (numberOfClients == 1) {
        console.log(`Joining room ${roomId} and emitting room_joined socket event`)
        socket.join(roomId)
        socket.emit('room_joined', roomId)
      } else {
        console.log(`Can't join room ${roomId}, emitting full_room socket event`)
        socket.emit('full_room', roomId)
      }
    })

    socket.on('room message', ({roomID, message}) => {
      socket.broadcast.to(roomID).emit('room message', message);
    });

    // Handle WebRTC
    socket.on('start_call', (roomID) => {
      console.log("start_call")
      socket.broadcast.to(roomID).emit('start_call')
    });

    socket.on('webrtc_offer', (event) => {
      console.log("webrtc_offer")
      console.log(event.sdp)
      socket.broadcast.to(event.roomID).emit('webrtc_offer', event.sdp)
    });

      socket.on('webrtc_answer', (event) => {
      console.log("webrtc_answer")
      console.log(event.sdp)
      socket.broadcast.to(event.roomID).emit('webrtc_answer', event.sdp)
    });

      socket.on('webrtc_ice_candidate', (event) => {
      console.log("webrtc_ice_candidate")
      console.log(event)
      socket.broadcast.to(event.roomID).emit('webrtc_ice_candidate', event)
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      if (userID !== undefined) {
        delete (connectedUsers as any)[userID];
        socket.broadcast.emit("offline", {userID: userID})
        console.log(`User ${userID} disconnected`);
        console.log(connectedUsers)
      }
    });
    }
    catch (err: any) {
        console.log(err);
        socket.emit("connection", {error: err.message});
      }
  });
  return {
    notify,
    createRoom,
    createChat
  };
};