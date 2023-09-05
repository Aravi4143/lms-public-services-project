import { RequestHandler } from "express";
import { z } from "zod";
import { db } from "../common/db";
import { comparePassword, createToken } from "../common/auth";
import detectFace from "../common/detect-face";
import tableClient from "../common/table-client";
import { TableClient } from "@azure/data-tables";
import matchFace from "../common/match-face";

const LoginDataSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1).optional(),
  image: z.string().min(1).optional(),
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
      isPasswordValid = await comparePassword(loginData.password, foundUser.passwordHash);
      if (!isPasswordValid) {
        return res.status(401).json({
          message: "Invalid password",
        });
      }
    } else if (req.file) {
      const faceDetectResult: any = await detectFace(req.file.path);

      if (!faceDetectResult || !faceDetectResult.descriptor) {
        return res.status(400).json({ message: 'No face detected in the image' });
      }

      console.log("Face detected successfully");
      const actualDescriptor = faceDetectResult.descriptor;
      const client: TableClient = tableClient("customers");
      const response: any = await client.getEntity(loginData.username, loginData.username);
      const expectedDescriptor = new Float32Array(response.imageDescriptor.split(",").map(Number))
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
