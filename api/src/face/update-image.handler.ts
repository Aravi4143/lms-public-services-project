import { RequestHandler } from "express";
import { db } from "../common/db";
import { z } from "zod";
import detectFace from "../common/detect-face";

const AuthDataSchema = z.object({
  username: z.string().min(1),
  image: z.any().optional(),
});

export const updateImageHandler: RequestHandler = async (req, res, next) => {
  try {
    const registerData = AuthDataSchema.parse(req.body);
    console.log(
      "🚀 ~ file: update-image.handler.ts ~ line 15 ~ updateImageHandler:RequestHandler= ~ req.username",
      registerData.username
    );
    const foundUser = await db.user.findUnique({
      where: {
        username: registerData.username,
      },
    });

    if (!foundUser) {
      return res.status(401).json({
        message: "Invalid username",
      });
    }

    //Extract descriptor from image
    if (req.file) {
      const faceDescriptor: string | undefined = await detectFace(
        req.file.path
      );
      if (!faceDescriptor) {
        return res
          .status(400)
          .json({ message: "No face detected in the image" });
      }
      console.log("Face detected successfully");
      const user = await db.user.update({
        where: {
          username: registerData.username,
        },
        data: {
          descriptor: String(faceDescriptor),
        },
      });
      console.log("Updated Face for the user:", user.username);

      return res.json({
        status: "success",
      });
    }
    return res
      .status(400)
      .json({ message: "Missing Image! Please try again..." });
  } catch (error) {
    next(error);
  }
};
