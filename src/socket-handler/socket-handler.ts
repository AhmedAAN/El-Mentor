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
    const receiverId = new ObjectId(ID)
    const receiverSocketId = connectedUsers[receiverId.toString()]

    const socket = io.sockets.sockets.get(receiverSocketId)

    try{
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
    }
    catch(err){
      console.log(err);
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
          { user: receiver._id, userName: receiver.userName },
          { user: sender._id, userName: sender.userName }
        ],
        messages: [],
        lastMessage: {receiver: receiver._id, text: `${sender.userName} created a new chat`},
        lastUsage: new Date()
      });

      const chat = await Chats.findOne({ _id: result.insertedId })

      if (!chat) {
        throw new Error('Chat not found');
      }

      const update: any = {
        $push: {
          chats: { chatID: chat?._id }
         }
      };

      await UserChats.findOneAndUpdate({ userID: sender?._id }, update);
      await UserChats.findOneAndUpdate({ userID: receiver?._id }, update);

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
    const cookies: string = socket.handshake.headers.cookie || "";
    const jwt = cookie.parse(cookies).Authorization;
    const secretKey = process.env.SECRETKEY || "";
    const ID = Jwt.verify(jwt, secretKey);
    if(typeof(ID)!='string' ){
      var userID = ID._id
      
    }

  
    if(userID){
      connectedUsers[userID] = socket.id
      socket.broadcast.emit("online", {userID: userID})
      console.log(`User ${userID} connected`);
      console.log(connectedUsers)
    }

    // Get chats
    socket.on('get chats', async (page: any, callback) => {
      try{
        const limit = 20;
        const skip = (page - 1) * limit;

        const userchats = await UserChats.findOne({ userID: new ObjectId(userID) })
        console.log(userchats)
        console.log(userID)

        if (!userchats) {
          throw new Error('No user chats found');
        }
        
        const chatIDs = userchats.chats.map((chat: { chatID: any; }) => chat.chatID);
        const chats = await Chats.find({ _id: { $in: chatIDs } }, 
          { projection: { messages: false } })
          .sort({lastUsage: -1})
          .limit(limit)
          .skip(skip)
          .toArray();

          callback(chats);
        console.log(chats)
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
        console.log(err);
        callback({error: err.message});
      }
    })

    // Listen for chat messages
    socket.on('message', async ({chatID, msg}) => {
      try{
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
          if(!(user.user).equals(user_id)) {
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
            $set: { lastUsage: currentTime,
            lastMessage: lastMessage }
        }
        );

        if (result.modifiedCount === 0) {
          throw new Error('Message not added');
        };

        for (let receiver of receivers) {
          let receiverSocketId = connectedUsers[(receiver.user).toString()];
          if (receiverSocketId) {
            io.to(receiverSocketId).emit('message', {message: messagePacket});
          }
        }
        socket.emit("message", {message: messagePacket})
      }
      catch(err) {
        socket.emit("message", {error: err})
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
        .limit(limit)
        .skip(skip)
        .toArray();
        const packet = messages.map(({ messages }) => messages)
    
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
      socket.broadcast.to(roomID).emit('start_call')
    });

    socket.on('webrtc_offer', (event) => {
      socket.broadcast.to(event.roomID).emit('webrtc_offer', event.sdp)
    });

    socket.on('webrtc_answer', (event) => {
      socket.broadcast.to(event.roomID).emit('webrtc_answer', event.sdp)
    });

    socket.on('webrtc_ice_candidate', (event) => {
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
  });
  return {
    notify,
    createRoom,
    createChat
  };
};