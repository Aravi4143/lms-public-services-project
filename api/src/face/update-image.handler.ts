import { RequestHandler } from 'express';
import detectFace from '../common/detect-face';
import { z } from 'zod';
import { TableClient } from '@azure/data-tables';
import tableClient from '../common/table-client';
import updateEntity from '../common/update-entity';

const AuthDataSchema = z.object({
    username: z.string().min(1),
    image: z.string().min(0),
    imageDescriptor: z.string().min(0),
  });

export const updateImageHandler: RequestHandler = async (req, res, next) => {
  try {
    const registerData = AuthDataSchema.parse(req.body);
    console.log(
        "🚀 ~ file: update-image.handler.ts ~ line 14 ~ updateImageHandler:RequestHandler= ~ req.username",
        registerData.username
      );

    const client: TableClient = tableClient("customers");
    const entity: any = {
        partitionKey: registerData.username,
        rowKey: registerData.username,
        image: registerData.image,
        imageDescriptor: registerData.imageDescriptor,
        identificationComplete: registerData.imageDescriptor.length > 0 ? true : false
      };

    await updateEntity(client, entity);
    console.log("Updated entity in customers data table for user: ", entity.PartitionKey);
    return res.json({
        status: "success"
      });
  } catch (error) {
    next(error);
  }
};