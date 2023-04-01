/* eslint-disable @typescript-eslint/no-var-requires */
import 'dotenv/config';

import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { v4 as uuid } from 'uuid';
import * as AWS from 'aws-sdk';
import * as multerS3 from 'multer-s3';

const s3 = new AWS.S3();

s3.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  region: process.env.AWS_REGION!,
});

const storage = multerS3({
  s3,
  bucket: process.env.AWS_S3_BUCKET_NAME,
  key: function (request, file, cb) {
    file.filename = uuid();

    cb(null, `${file.filename}`);
  },
});

export function UploadSingleImage(fieldName: string) {
  return applyDecorators(
    UseInterceptors(
      FileInterceptor(fieldName, {
        storage: storage,
        limits: {},
      }),
    ),
  );
}
