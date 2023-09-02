import { Router } from "express";
import { validateFaceHandler } from "./validate-face.handler";
import { updateImageHandler } from "./update-image.handler";
import multer from 'multer';

const faceRouter = Router();
const upload = multer({ dest: 'uploads/' });

// -> Api to return whether it identifies a face in the picture
faceRouter.post("/identify", upload.single('image'), validateFaceHandler);

faceRouter.post("/update", upload.single('image'), updateImageHandler);

// -> Api to match the face uploaded by user with face in db

// -> Api to update face of user / Add multiple faces of same customer

export default faceRouter;