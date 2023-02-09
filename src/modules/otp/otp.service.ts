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
import { CheckSignupOtpInputDto } from './dto/check-signup-otp.dto';
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
const TWILIO_PHONE_NUMBER_BOUGHT = process.env.TWILIO_PHONE_NUMBER_BOUGHT;
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
      return await this.sendPhoneOTP(body.phone, OtpAction.SIGNUP);
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

  async checkSignupOTP(body: CheckSignupOtpInputDto): Promise<boolean> {
    return await this.checkPhoneOTP(body.phone, body.otp, OtpAction.SIGNUP);
  }

  async sendFindingIdOtp(
    body: SendFindingIdOtpInputDto,
  ): Promise<SendFindingIdOtpOutputDto> {
    try {
      const trimedPhoneNumber = this.trimPhoneNumber(body.phone);
      const encryptedPhone = await this.commonService.encrypt(
        trimedPhoneNumber,
      );

      const user = await this.userRepo.findOne({
        where: { phone: encryptedPhone },
        relations: { account: true },
      });

      if (!user) {
        throw new NotFoundException(OTP_ERROR.USER_NOT_FOUND);
      }

      if (!user.phone) {
        throw new NotFoundException(OTP_ERROR.USER_PHONE_NOT_FOUND);
      }

      return await this.sendPhoneOTP(body.phone, OtpAction.FIND_ID);
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
      const result = await this.checkPhoneOTP(
        body.phone,
        body.otp,
        OtpAction.FIND_ID,
      );

      if (result) {
        const trimedPhoneNumber = this.trimPhoneNumber(body.phone);
        const encryptedPhone = await this.commonService.encrypt(
          trimedPhoneNumber,
        );

        const foundUser = await this.userRepo.findOne({
          where: { phone: encryptedPhone },
          relations: { account: true },
        });

        if (foundUser) {
          return { email: foundUser.account.email };
        }
      }
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

  private async sendPhoneOTP(phone: string, action: OtpAction) {
    const expireDate = moment().add(OTP_EXPIRE_MINUTE, 'm').toDate();
    const trimedPhoneNumber = this.trimPhoneNumber(phone);
    const newOtpNumber = this.createOTP();
    const encryptedPhone = await this.commonService.encrypt(trimedPhoneNumber);

    const existingOtp = await this.otpRepo.findOne({
      where: { phone: encryptedPhone, action },
    });

    if (existingOtp) {
      await this.sendPhoneAuthNubmer(trimedPhoneNumber, newOtpNumber);

      await this.otpRepo.update(
        { phone: encryptedPhone, action },
        { reqCount: existingOtp.reqCount + 1, otp: newOtpNumber, expireDate },
      );

      this.logger.log(`인증번호 재발송 완료 - phone(${trimedPhoneNumber})`);

      return { expireDate };
    }

    await this.sendPhoneAuthNubmer(trimedPhoneNumber, newOtpNumber);

    const newOtp = new Otp();
    newOtp.otp = newOtpNumber;
    newOtp.expireDate = expireDate;
    newOtp.action = action;
    newOtp.phone = await this.commonService.encrypt(trimedPhoneNumber);

    await this.otpRepo.save(newOtp);

    this.logger.log(`새 인증번호 발급 완료 phone(${trimedPhoneNumber})`);

    return { expireDate };
  }

  private async checkPhoneOTP(
    phone: string,
    otp: string,
    action: OtpAction,
  ): Promise<boolean> {
    const trimedPhoneNumber = this.trimPhoneNumber(phone);
    const encryptedPhone = await this.commonService.encrypt(trimedPhoneNumber);

    const existingOtp = await this.otpRepo.findOne({
      where: { otp, phone: encryptedPhone, action },
    });

    if (!existingOtp) {
      throw new NotFoundException(OTP_ERROR.OTP_NOT_FOUND);
    }

    if (moment(existingOtp.expireDate).diff(moment()) < 0) {
      throw new BadRequestException(OTP_ERROR.OTP_EXPIRE);
    }

    return true;
  }

  private trimPhoneNumber(phone: string) {
    return phone.replace(/[-,.+]/gi, '').replace(/\s*/g, '');
  }

  private async sendPhoneAuthNubmer(phone: string, otp: string) {
    await client.messages.create({
      from: TWILIO_PHONE_NUMBER_BOUGHT,
      to: `+82${phone}`,
      body: `[골프랑 인증번호] ${otp} `,
    });
  }
}
