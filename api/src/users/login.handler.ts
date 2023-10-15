import { RequestHandler } from "express";
import { z } from "zod";
import { db } from "../common/db";
import { comparePassword, createToken } from "../common/auth";
import detectFace from "../common/detect-face";
import matchFace from "../common/match-face";

const LoginDataSchema = z.object({
  username: z.string().min(1),
  password: z.string().optional(),
  image: z.any().optional(),
});

export const loginHandler: RequestHandler = async (req, res, next) => {
  try {
    const loginData = LoginDataSchema.parse(req.body);
    const foundUser = await db.user.findUnique({
      where: {
        username: loginData.username,
      },
    });

    // If no user found, return error
    if (!foundUser) {
      return res.status(401).json({
        message: "Invalid username",
      });
    }

    let isPasswordValid = false;
    let isImageValid = false;

    if (loginData.password) {
      isPasswordValid = await comparePassword(
        loginData.password,
        foundUser.passwordHash
      );
      if (!isPasswordValid) {
        return res.status(401).json({
          message: "Invalid password",
        });
      }
    } else if (req.file) {
      if (!foundUser.descriptor) {
        return res
          .status(400)
          .send("No face authentication found for this user");
      }

      const faceDescriptor: string | undefined = await detectFace(
        req.file.path
      );
      if (!faceDescriptor) {
        return res
          .status(400)
          .json({ message: "No face detected in the image" });
      }

      console.log("Face detected successfully");
      const actualDescriptor = new Float32Array(
        faceDescriptor.split(",").map(Number)
      );
      const expectedDescriptor = new Float32Array(
        foundUser.descriptor.split(",").map(Number)
      );
      isImageValid = await matchFace(actualDescriptor, expectedDescriptor);
      if (!isImageValid) {
        return res.status(401).json({
          message: "Invalid image captured",
        });
      }
    }
    // Create token
    const token = createToken({
      id: foundUser.id,
      username: foundUser.username,
      name: foundUser.name,
    });

    // Return token
    return res.json({
      token,
      user: {
        id: foundUser.id,
        username: foundUser.username,
        name: foundUser.name,
      },
    });
  } catch (error) {
    next(error);
  }
};
