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
  CheckSMSOTPInputDto,
  CheckSMSOTPOutputDto,
} from './dto/check-sms-otp.dto';
import { SendSMSOutputDto, SendSMSInPutDto } from './dto/send-sms.dto';
import { Otp } from './entities/otp.entity';
import { OtpAction } from './enum/otp.enum';
import { OtpError, OTP_ERROR } from './error/otp.error';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);
const moment = require('moment');

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

  private readonly EXPIRE_MINUTE = 10;

  createOTP = () =>
    [0, 0, 0, 0, 0, 0].map(() => Math.floor(Math.random() * 10)).join('');

  async sendSMS(body: SendSMSInPutDto): Promise<SendSMSOutputDto | any> {
    try {
      const encryptedPhone = await this.commonService.encrypt(body.phone);

      const user = await this.userRepo.findOne({
        where: { phone: encryptedPhone },
        relations: { accounts: true },
        select: {
          id: true,
          phone: true,
          nickname: true,
          accounts: { email: true },
        },
      });

      if (!user) {
        throw new NotFoundException(OTP_ERROR.USER_NOT_FOUND);
      }

      if (!user.phone) {
        throw new NotFoundException(OTP_ERROR.USER_PHONE_NOT_FOUND);
      }

      const expireDate = moment().add(this.EXPIRE_MINUTE, 'm').toDate();
      const receiverNumber = `+82${body.phone}`;

      // // 기존 otp 존재 유무 확인
      const existingOtp = await this.otpRepo.findOne({
        where: {
          email: user.accounts[0].email,
          isActive: true,
          action: body.action,
        },
      });

      const newOtpNumber = this.createOTP();

      // // otp 존재하지 않을 경우 새로 발급
      if (!existingOtp) {
        const newOtp = new Otp();
        newOtp.email = user.accounts[0].email;
        newOtp.otp = newOtpNumber;
        newOtp.expireDate = expireDate;
        newOtp.action = body.action;

        await this.otpRepo.save(newOtp);

        client.messages
          .create({
            from: process.env.TWILIO_MY_PHONE_NUMBER,
            to: receiverNumber,
            body: `골프랑 인증번호는 ${newOtp.otp} 입니다.`,
          })
          .then((message) => console.log('새 인증번호 발급 완료'))
          .done();

        return { email: newOtp.email, expireDate };
      }

      // otp 존재할 경우 업데이트 후 재발급
      await this.otpRepo.update(
        { id: existingOtp.id, action: body.action },
        {
          reqCount: existingOtp.reqCount + 1,
          otp: newOtpNumber,
          expireDate,
        },
      );

      client.messages
        .create({
          from: process.env.TWILIO_MY_PHONE_NUMBER,
          to: receiverNumber,
          body: `골프랑 인증번호는 ${newOtpNumber} 입니다.`,
        })
        .then((message) => console.log('인증번호 재발급 완료'))
        .done();

      return { email: user.accounts[0].email, expireDate };
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

  async checkSMSOTP(body: CheckSMSOTPInputDto): Promise<CheckSMSOTPOutputDto> {
    try {
      const existingOtp = await this.otpRepo.findOne({
        where: {
          otp: body.otp,
          email: body.email,
          action: body.action,
        },
        select: {
          id: true,
          email: true,
          action: true,
          expireDate: true,
        },
      });

      if (!existingOtp) {
        throw new NotFoundException(OTP_ERROR.OTP_NOT_FOUND);
      }

      if (moment(existingOtp.expireDate).diff(moment()) < 0) {
        throw new BadRequestException(OTP_ERROR.OTP_EXPIRE);
      }

      if (existingOtp.action === OtpAction.FIND_ID) {
        return { result: existingOtp.email };
      }

      return {
        result: 'done',
      };
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
