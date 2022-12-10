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
import { ApiTags } from '@nestjs/swagger';
import { ResultFormatInterceptor } from 'src/common/interceptor/result-format.interceptor';
import { SendResetPsEmailInputDto } from './dto/send-reset-ps-email.dto';
import { SwaggerDefault } from 'src/common/decorator/swagger.decorator';

@ApiTags('MAIL')
@Controller('mail')
@UseInterceptors(ResultFormatInterceptor)
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('reset-ps')
  @SwaggerDefault(
    '비밀번호 찾기 시 이메일 발송',
    'done',
    '비밀번호 찾기 시 이메일 발송',
  )
  async sendResetPsEmail(
    @Body() body: SendResetPsEmailInputDto,
  ): Promise<String> {
    return await this.mailService.sendResetPsEmail(body);
  }
}
