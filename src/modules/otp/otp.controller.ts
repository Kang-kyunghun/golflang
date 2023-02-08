import { Controller, Post, Body, UseInterceptors } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SwaggerDefault } from 'src/common/decorator/swagger.decorator';
import { ResultFormatInterceptor } from 'src/common/interceptor/result-format.interceptor';
import {
  CheckFindingIdOtpInputDto,
  CheckFindingIdOtpOutputDto,
} from './dto/check-finding-id-otp.dto';
import { CheckSignupOtpInputDto } from './dto/check-signup-otp.dto';
import {
  SendFindingIdOtpInputDto,
  SendFindingIdOtpOutputDto,
} from './dto/send-finding-id-otp.dto';
import {
  SendSignupOtpInputDto,
  SendSignupOtpOutputDto,
} from './dto/send-signup-otp.dto';
import { OtpService } from './otp.service';

@ApiTags('OTP')
@Controller('otp')
// @UseInterceptors(ResultFormatInterceptor)
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @Post('signup')
  @SwaggerDefault('회원가입 인증번호 발송', SendSignupOtpOutputDto)
  async sendSignupOTP(
    @Body() body: SendSignupOtpInputDto,
  ): Promise<SendSignupOtpOutputDto> {
    return await this.otpService.sendSignupOTP(body);
  }

  @Post('signup/check')
  @SwaggerDefault('회원가입 인증번호 검증')
  async checkSignupOTP(@Body() body: CheckSignupOtpInputDto): Promise<boolean> {
    return await this.otpService.checkSignupOTP(body);
  }

  @Post('find-id')
  @SwaggerDefault('아이디 찾기 인증번호 발송', SendFindingIdOtpOutputDto)
  async sendFindingIdOtp(
    @Body() body: SendFindingIdOtpInputDto,
  ): Promise<SendFindingIdOtpOutputDto> {
    return await this.otpService.sendFindingIdOtp(body);
  }

  @Post('find-id/check')
  @SwaggerDefault('아이디 찾기 인증번호 검증', CheckFindingIdOtpOutputDto)
  async checkFindingIdOtp(
    @Body() body: CheckFindingIdOtpInputDto,
  ): Promise<CheckFindingIdOtpOutputDto> {
    return await this.otpService.checkFindingIdOtp(body);
  }
}
