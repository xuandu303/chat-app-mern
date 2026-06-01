import { Router } from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { createChannel, getUserChannels, getChannelMessages } from "../controllers/channelCtrl.js";

const channelsRoutes = Router();

channelsRoutes.post("/create-channel", verifyToken, createChannel);
channelsRoutes.get("/get-user-channels", verifyToken, getUserChannels);
channelsRoutes.get("/get-channel-messages/:channelId", verifyToken, getChannelMessages);

export default channelsRoutes;
