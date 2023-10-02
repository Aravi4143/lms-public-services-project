import { RequestHandler } from 'express';
import { db } from "../common/db";
import { z } from 'zod';
import { TableClient } from '@azure/data-tables';
import tableClient from '../common/table-client';
import updateEntity from '../common/update-entity';

const AuthDataSchema = z.object({
    username: z.string().min(1),
    imageDescriptor: z.string().min(0),
  });

export const updateImageHandler: RequestHandler = async (req, res, next) => {
  try {
    const registerData = AuthDataSchema.parse(req.body);
    console.log(
        "🚀 ~ file: update-image.handler.ts ~ line 14 ~ updateImageHandler:RequestHandler= ~ req.username",
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

    const user = await db.user.update({
      where: {
        username: registerData.username,
      },
      data: {
        descriptor: registerData.imageDescriptor,
      }
    })

    return res.json({
        status: "success"
      });
  } catch (error) {
    next(error);
  }
};