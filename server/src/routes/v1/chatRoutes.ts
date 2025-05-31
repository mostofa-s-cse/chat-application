import express from "express";
import {
  addUserToChat,
  createGroupChat,
  getMessages,
  sendMessage,
} from "../../controllers/chatController";

const router = express.Router();

router.post("/send", sendMessage);
router.get("/messages", getMessages);
router.post("/add-user", addUserToChat);
router.post("/create-group", createGroupChat);

export default router;
