import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDoRUlXhAoCY--_ygvMJo7sbQyNehf-MEI",
  authDomain: "mentor-audio.firebaseapp.com",
  projectId: "mentor-audio",
  storageBucket: "mentor-audio.appspot.com",
  messagingSenderId: "359934489876",
  appId: "1:359934489876:web:6c154041e41349916bbe01",
  measurementId: "G-DBJ6YRRQK9"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
export default storage