import { Controller, Post, Body, UseInterceptors } from '@nestjs/common';
import { MailService } from './mail.service';
import { ApiTags } from '@nestjs/swagger';
import { ResultFormatInterceptor } from 'src/common/interceptor/result-format.interceptor';
import { SendResetPasswordEmailInputDto } from './dto/send-reset-ps-email.dto';
import { SwaggerDefault } from 'src/common/decorator/swagger.decorator';

@ApiTags('MAIL')
@Controller('mail')
// @UseInterceptors(ResultFormatInterceptor)
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('reset-password')
  @SwaggerDefault('비밀번호 찾기 시 이메일 발송')
  async sendResetPasswordEmail(
    @Body() body: SendResetPasswordEmailInputDto,
  ): Promise<boolean> {
    return await this.mailService.sendResetPasswordEmail(body);
  }
}
