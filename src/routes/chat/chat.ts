import express from "express";
import { notify } from "../../controllers/chat/chat";
import { getNotifications } from "../../controllers/chat/chat";
import { createRoom } from "../../controllers/chat/chat";
import { createChat } from "../../controllers/chat/chat";

const router = express.Router();

router.post("/notify", notify);
router.get("/notifications/:userID", getNotifications);
router.get("/createRoom", createRoom);
router.post("/createChat", createChat);

export default router;