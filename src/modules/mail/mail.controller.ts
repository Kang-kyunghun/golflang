import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
} from '@nestjs/common';
import { MailService } from './mail.service';
import { CreateMailDto } from './dto/create-mail.dto';
import { UpdateMailDto } from './dto/update-mail.dto';
import { ApiTags } from '@nestjs/swagger';
import { ResultFormatInterceptor } from 'src/common/interceptor/result-format.interceptor';

@ApiTags('MAIL')
@Controller('mail')
@UseInterceptors(ResultFormatInterceptor)
export class MailController {
  constructor(private readonly mailService: MailService) {}
}
