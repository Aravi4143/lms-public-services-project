import { RequestHandler } from 'express';
import detectFace from '../common/detect-face';
import { z } from 'zod';
import { writeFile } from "fs";

const FormDataSchema = z.object({
  image: z.string().min(1).optional(),
});

export const validateFaceHandler: RequestHandler = async (req, res, next) => {
  try {
    console.log(
        "🚀 ~ file: get-face-identifier.handler.ts ~ line 7 ~ getFaceIdentifierHandler:RequestHandler= ~ req.body",
        req.body
      );

    if (!req.file) {
      return res.status(400).json({ error: 'No file was uploaded' });
    }
    // Load the uploaded image
    const faceDetectResult: any = await detectFace(req.file.path);
    if (
        faceDetectResult &&
        faceDetectResult.descriptor
      ) {
        console.log("Face detected successfully");
        return res.status(200).json({
          success: "Face detected successfully!",
          faceDescriptor: String(faceDetectResult.descriptor)
        });
      } else {
        return res.status(200).json({ error: 'No face detected in the image' });
      }
  } catch (error) {
    next(error);
  }
};
