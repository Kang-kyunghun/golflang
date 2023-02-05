/* eslint-disable @typescript-eslint/no-var-requires */
import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

const path = require('path');
const crypto = require('crypto');

import { Buffer } from 'buffer';
import * as AWS from 'aws-sdk';
import * as multerS3 from 'multer-s3';
import 'dotenv/config';

const s3 = new AWS.S3();
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

export function UploadSingleImage(fieldName: string) {
  return applyDecorators(
    UseInterceptors(
      FileInterceptor(fieldName, {
        storage: multerS3({
          s3,
          bucket: process.env.AWS_S3_BUCKET_NAME,
          // acl: 'public-read',
          key: function (request, file, cb) {
            file.originalname = Buffer.from(
              file.originalname,
              'latin1',
            ).toString('utf8');

            const ext = path.extname(file.originalname);

            const basename = path.basename(file.originalname, ext);

            file.filename = `${basename}_${crypto
              .randomBytes(5)
              .toString('hex')}`;

            cb(null, `${file.filename}${ext}`);
          },
        }),
        limits: {},
      }),
    ),
  );
}
