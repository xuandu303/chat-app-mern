import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary.js";

const profileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "chat-app/profiles",
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
  },
});

export const uploadProfileImage = multer({ storage: profileStorage });

const fileStorage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => ({
    folder: "chat-app/files",
    resource_type: "auto",
    public_id: `${Date.now()}_${file.originalname.replace(/\s+/g, "_")}`,
  }),
});

export const uploadMessageFile = multer({ storage: fileStorage });
