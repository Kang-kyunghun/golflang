import { BadRequestException, Injectable } from '@nestjs/common';
import { UploadFile } from './entity/upload-file.entity';

const path = require('path');

@Injectable()
export class UploadFileService {
  constructor() {}

  async uploadSingleImageFile(file: Express.MulterS3.File) {
    try {
      const image = new UploadFile();
      image.name = file.originalname;
      image.hash = file.filename;
      image.size = file.size;
      image.url = file.location;
      image.ext = path.extname(file.originalname);
      image.mime = file.mimetype;

      return image;
    } catch (error) {
      throw new BadRequestException('image upload failed');
    }
  }
}
