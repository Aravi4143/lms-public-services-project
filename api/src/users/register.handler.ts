import { RequestHandler } from "express";
import { z } from "zod";
import { createToken, hashPassword } from "../common/auth";
import { db } from "../common/db";
import { TableClient } from "@azure/data-tables";
import tableClient from "../common/table-client";
import createEntity from "../common/create-entity";

const AuthDataSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
  name: z.string().min(1),
  image: z.string().min(0),
  imageDescriptor: z.string().min(0),
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

    // Create user
    const user = await db.user.create({
      data: {
        username: registerData.username,
        passwordHash,
        name: registerData.name,
      },
      select: {
        id: true,
        name: true,
        username: true,
      },
    });

    const client: TableClient = tableClient("customers");
    const entity: any = {
      PartitionKey: user.username,
      RowKey: user.username,
      image: registerData.image,
      imageDescriptor: registerData.imageDescriptor,
      identificationComplete: registerData.imageDescriptor.length > 0 ? true : false
    };
    await createEntity(client, entity);
    console.log("Created entity in customers data table for user: ", entity.PartitionKey);

    return res.json({
      user,
      token: createToken(user),
    });
  } catch (error) {
    next(error);
  }
};
