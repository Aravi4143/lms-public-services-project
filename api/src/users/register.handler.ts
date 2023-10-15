import { RequestHandler } from "express";
import { z } from "zod";
import { createToken, hashPassword } from "../common/auth";
import { db } from "../common/db";
import detectFace from "../common/detect-face";

const AuthDataSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
  name: z.string().min(1),
  image: z.any().optional(),
});

export const registerHandler: RequestHandler = async (req, res, next) => {
  try {
    const registerData = AuthDataSchema.parse(req.body);

    // Check if user already exists
    const foundUser = await db.user.findUnique({
      where: {
        username: registerData.username,
      },
    });

    // If user exists, return error
    if (foundUser) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    // Hash password
    const passwordHash = await hashPassword(registerData.password);

    //Extract descriptor from image
    let faceDescriptor: string | undefined;
    if (req.file) {
      faceDescriptor = await detectFace(req.file.path);
      if (!faceDescriptor) {
        return res
          .status(400)
          .json({ message: "No face detected in the image" });
      }
      console.log("Face detected successfully");
    }

    // Create user
    const user = await db.user.create({
      data: {
        username: registerData.username,
        passwordHash,
        name: registerData.name,
        descriptor: faceDescriptor || null,
      },
      select: {
        id: true,
        name: true,
        username: true,
      },
    });

    return res.json({
      user,
      token: createToken(user),
    });
  } catch (error) {
    next(error);
  }
};
