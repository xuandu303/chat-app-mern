import { Router } from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { getMessages, uploadFile } from "../controllers/messageCtrl.js";
import { uploadMessageFile } from "../utils/multer.js";

const messagesRoutes = Router();

messagesRoutes.post("/get-messages", verifyToken, getMessages);
messagesRoutes.post("/upload-file", verifyToken, uploadMessageFile.single("file"), uploadFile);

export default messagesRoutes;
