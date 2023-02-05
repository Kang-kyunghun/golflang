import { Controller } from '@nestjs/common';
import { UploadFileService } from './upload-file.service';

import { ApiTags } from '@nestjs/swagger';

@ApiTags('UPLOAD-FILE')
@Controller('upload-file')
export class UploadFileController {
  constructor(private readonly uploadFileService: UploadFileService) {}
}
