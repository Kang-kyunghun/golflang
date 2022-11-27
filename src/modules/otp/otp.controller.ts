import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SwaggerDefault } from 'src/common/decorator/swagger.decorator';
import { ResultFormatInterceptor } from 'src/common/interceptor/result-format.interceptor';
import { SendSMSOutputDto, SendSMSQueryDto } from './dto/send-sms.dto';
import { OtpService } from './otp.service';

@ApiTags('OTP')
@Controller('otp')
@UseInterceptors(ResultFormatInterceptor)
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @Post('sms')
  @SwaggerDefault(
    '핸드폰 인증번호 발송',
    SendSMSOutputDto,
    '핸드폰 인증번호 발송',
  )
  async sendSMS(@Query() query: SendSMSQueryDto): Promise<SendSMSOutputDto> {
    return await this.otpService.sendSMS(query);
  }

  @Post('sms/check')
  async checkSMSOTP(@Body() body) {
    return await this.otpService.checkSMSOTP(body);
  }
}
