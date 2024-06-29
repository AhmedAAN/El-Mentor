import storage from "../../utils/firebase"
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection } from "../../models/connection";
import { ObjectId } from "mongodb";
import { Server } from 'socket.io';

const Chats = collection("Chats");

type ConnectedUsers = {
  [userID: string]: string;
}

const saveAudioFile = async (audioBlob: Buffer) => {
  const filename = `audio-${Date.now()}.wav`;
  const storageRef = ref(storage, `audio/${filename}`);

  try {
    const snapshot = await uploadBytes(storageRef, audioBlob);
    console.log('Uploaded a blob or file!');
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('File available at', downloadURL);
    return({ success: true, message: 'Audio uploaded successfully', downloadURL });
  } catch (error) {
    console.error('Error saving audio file:', error);
    return({ success: false, message: 'Error saving audio file' });
  }
};

export const sendAudioFile = async (audioBlob: Buffer, userID: string, chatID: string, connectedUsers:ConnectedUsers, io: any, callback: (result: { success: boolean; message: string; downloadURL?: string }) => void) => {
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

    const saveAudio = await saveAudioFile(audioBlob)

    if (!saveAudio.success) {
      callback(saveAudio)
    }

    const file = saveAudio.downloadURL

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
      audio: file
    }

    const lastMessage = {
      sender: user_id,
      text: "audio message"
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
    callback(saveAudio)
  }
  catch (err) {
    console.error('Error saving audio link to chat database:', err);
    callback({ success: false, message: 'Error saving audio file to datebase' });
  }
};