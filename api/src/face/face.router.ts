import { Router } from "express";
import { updateImageHandler } from "./update-image.handler";
import multer from "multer";

const faceRouter = Router();
const upload = multer({ dest: "uploads/" });

faceRouter.post("/update", upload.single("image"), updateImageHandler);

export default faceRouter;
