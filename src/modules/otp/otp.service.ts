/* eslint-disable @typescript-eslint/no-var-requires */
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommonService } from 'src/common/common.service';
import { Repository } from 'typeorm';
import { User } from '../user/entity/user.entity';
import {
  CheckFindingIdOtpInputDto,
  CheckFindingIdOtpOutputDto,
} from './dto/check-finding-id-otp.dto';
import {
  CheckSignupOtpInputDto,
  CheckSignupOtpOutputDto,
} from './dto/check-signup-otp.dto';
import {
  SendFindingIdOtpInputDto,
  SendFindingIdOtpOutputDto,
} from './dto/send-finding-id-otp.dto';
import {
  SendSignupOtpInputDto,
  SendSignupOtpOutputDto,
} from './dto/send-signup-otp.dto';
import { Otp } from './entities/otp.entity';
import { OtpAction } from './enum/otp.enum';
import { OtpError, OTP_ERROR } from './error/otp.error';
const moment = require('moment');

const PHONE_AUTH_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const PHONE_AUTH_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const AUTH_PHONE_NUMBER = process.env.TWILIO_MY_PHONE_NUMBER;
const OTP_EXPIRE_MINUTE = process.env.OTP_EXPIRE_TIME_IN_MINUTE;
const client = require('twilio')(PHONE_AUTH_ACCOUNT_SID, PHONE_AUTH_AUTH_TOKEN);

@Injectable()
export class OtpService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Otp)
    private readonly otpRepo: Repository<Otp>,
    private readonly commonService: CommonService,
    private readonly otpError: OtpError,
    private readonly logger: Logger,
  ) {}

  private createOTP = () =>
    [0, 0, 0, 0, 0, 0].map(() => Math.floor(Math.random() * 10)).join('');

  async sendSignupOTP(
    body: SendSignupOtpInputDto,
  ): Promise<SendSignupOtpOutputDto> {
    try {
      const expireDate = moment().add(OTP_EXPIRE_MINUTE, 'm').toDate();

      const trimedPhoneNumber = this.trimPhoneNumber(body.phone);

      const newOtpNumber = this.createOTP();

      const encryptedPhone = await this.commonService.encrypt(
        trimedPhoneNumber,
      );

      const existingOtp = await this.otpRepo.findOne({
        where: { phone: encryptedPhone, action: OtpAction.SIGNUP },
      });

      if (existingOtp) {
        await this.sendPhoneAuthNubmer(trimedPhoneNumber, newOtpNumber);

        await this.otpRepo.update(
          { phone: encryptedPhone, action: OtpAction.SIGNUP },
          {
            reqCount: existingOtp.reqCount + 1,
            otp: newOtpNumber,
            expireDate,
          },
        );

        this.logger.log(
          `회원가입 인증번호 재발송 완료 - phone(${trimedPhoneNumber})`,
        );

        return { expireDate };
      }

      await this.sendPhoneAuthNubmer(trimedPhoneNumber, newOtpNumber);

      const newOtp = new Otp();
      newOtp.otp = newOtpNumber;
      newOtp.expireDate = expireDate;
      newOtp.action = OtpAction.SIGNUP;
      newOtp.phone = await this.commonService.encrypt(body.phone);

      await this.otpRepo.save(newOtp);

      this.logger.log(`새 인증번호 발급 완료 phone(${trimedPhoneNumber})`);

      return { expireDate };
    } catch (error) {
      this.logger.error(error);

      const statusCode = error.response
        ? error.response.statusCode
        : HttpStatus.BAD_REQUEST;

      throw new HttpException(
        this.otpError.errorHandler(error.message),
        statusCode,
      );
    }
  }

  private trimPhoneNumber(phone: string) {
    return phone.replace(/[-,.+]/gi, '').replace(/\s*/g, '');
  }

  private async sendPhoneAuthNubmer(phone: string, otp: string) {
    await client.verify.v2
      .services('VA45e639ce9fd552e55923a2b56087300c')
      .verifications.create({
        from: AUTH_PHONE_NUMBER,
        to: `+82${phone}`,
        channel: 'sms',
        body: `[골프랑 인증번호] ${otp} `,
      })
      .then((res) => console.log('sendPhoneAuthNubmer', res));
  }

  async checkSignupOTP(
    body: CheckSignupOtpInputDto,
  ): Promise<CheckSignupOtpOutputDto> {
    try {
      const trimedPhoneNumber = this.trimPhoneNumber(body.phone);

      const encryptedPhone = await this.commonService.encrypt(
        trimedPhoneNumber,
      );

      const existingOtp = await this.otpRepo.findOne({
        where: {
          otp: body.otp,
          phone: encryptedPhone,
          action: OtpAction.SIGNUP,
        },
      });

      if (!existingOtp) {
        throw new NotFoundException(OTP_ERROR.OTP_NOT_FOUND);
      }

      if (moment(existingOtp.expireDate).diff(moment()) < 0) {
        throw new BadRequestException(OTP_ERROR.OTP_EXPIRE);
      }

      return { authentication: true };
    } catch (error) {
      this.logger.error(error);

      const statusCode = error.response
        ? error.response.statusCode
        : HttpStatus.BAD_REQUEST;

      throw new HttpException(
        this.otpError.errorHandler(error.message),
        statusCode,
      );
    }
  }

  async sendFindingIdOtp(
    body: SendFindingIdOtpInputDto,
  ): Promise<SendFindingIdOtpOutputDto> {
    try {
      const encryptedPhone = await this.commonService.encrypt(body.phone);
      const expireDate = moment().add(OTP_EXPIRE_MINUTE, 'm').toDate();
      const receiverNumber = `+82${body.phone}`;
      const newOtpNumber = this.createOTP();

      const user = await this.userRepo.findOne({
        where: { phone: encryptedPhone },
        relations: { account: true },
        select: {
          id: true,
          phone: true,
          nickname: true,
          account: { email: true },
        },
      });

      if (!user) {
        throw new NotFoundException(OTP_ERROR.USER_NOT_FOUND);
      }

      if (!user.phone) {
        throw new NotFoundException(OTP_ERROR.USER_PHONE_NOT_FOUND);
      }

      const existingOtp = await this.otpRepo.findOne({
        where: {
          phone: encryptedPhone,
          action: OtpAction.FIND_ID,
        },
      });

      if (existingOtp) {
        await this.otpRepo.update(
          { phone: encryptedPhone, action: OtpAction.FIND_ID },
          { reqCount: existingOtp.reqCount + 1, otp: newOtpNumber, expireDate },
        );

        client.messages
          .create({
            from: process.env.TWILIO_MY_PHONE_NUMBER,
            to: receiverNumber,
            body: `골프랑 인증번호는 ${newOtpNumber} 입니다.`,
          })
          .then((message) => console.log('인증번호 재발급 완료'))
          .done();

        return { expireDate };
      }

      const newOtp = new Otp();
      newOtp.otp = newOtpNumber;
      newOtp.expireDate = expireDate;
      newOtp.action = OtpAction.FIND_ID;
      newOtp.phone = await this.commonService.encrypt(body.phone);
      newOtp.email = user.account.email;

      await this.otpRepo.save(newOtp);

      client.messages
        .create({
          from: process.env.TWILIO_MY_PHONE_NUMBER,
          to: receiverNumber,
          body: `골프랑 인증번호는 ${newOtp.otp} 입니다.`,
        })
        .then((message) => console.log('새 인증번호 발급 완료'))
        .done();

      return { expireDate };
    } catch (error) {
      this.logger.error(error);

      const statusCode = error.response
        ? error.response.statusCode
        : HttpStatus.BAD_REQUEST;

      throw new HttpException(
        this.otpError.errorHandler(error.message),
        statusCode,
      );
    }
  }

  async checkFindingIdOtp(
    body: CheckFindingIdOtpInputDto,
  ): Promise<CheckFindingIdOtpOutputDto> {
    try {
      const encryptedPhone = await this.commonService.encrypt(body.phone);

      const existingOtp = await this.otpRepo.findOne({
        where: {
          otp: body.otp,
          phone: encryptedPhone,
          action: OtpAction.FIND_ID,
        },
      });

      if (!existingOtp) {
        throw new NotFoundException(OTP_ERROR.OTP_NOT_FOUND);
      }

      if (moment(existingOtp.expireDate).diff(moment()) < 0) {
        throw new BadRequestException(OTP_ERROR.OTP_EXPIRE);
      }

      return { email: existingOtp.email };
    } catch (error) {
      this.logger.error(error);

      const statusCode = error.response
        ? error.response.statusCode
        : HttpStatus.BAD_REQUEST;

      throw new HttpException(
        this.otpError.errorHandler(error.message),
        statusCode,
      );
    }
  }
}
