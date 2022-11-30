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
import {
  CheckSMSOTPInputDto,
  CheckSMSOTPOutputDto,
} from './dto/check-sms-otp.dto';
import { SendSMSOutputDto, SendSMSInPutDto } from './dto/send-sms.dto';
import { OtpService } from './otp.service';

@ApiTags('OTP')
@Controller('otp')
@UseInterceptors(ResultFormatInterceptor)
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @Post('sms')
  @SwaggerDefault('SMS 인증번호 발송', SendSMSOutputDto, 'SMS 인증번호 발송')
  async sendSMS(@Body() body: SendSMSInPutDto): Promise<SendSMSOutputDto> {
    return await this.otpService.sendSMS(body);
  }

  @Post('sms/check')
  @SwaggerDefault(
    'SMS 인증번호 확인',
    CheckSMSOTPOutputDto,
    'SMS 인증번호 확인',
  )
  async checkSMSOTP(
    @Body() body: CheckSMSOTPInputDto,
  ): Promise<CheckSMSOTPOutputDto> {
    return await this.otpService.checkSMSOTP(body);
  }
}
