import {
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
import { SendSMSOutputDto, SendSMSQueryDto } from './dto/send-sms.dto';
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

  async sendSMS(query: SendSMSQueryDto): Promise<SendSMSOutputDto | any> {
    try {
      const encryptedPhone = await this.commonService.encrypt(query.phone);

      const user = await this.userRepo.findOne({
        where: { phone: encryptedPhone },
        relations: { accounts: true },
        select: {
          id: true,
          phone: true,
          accounts: { email: true },
        },
      });

      if (!user) {
        throw new NotFoundException(OTP_ERROR.USER_NOT_FOUND);
      }

      if (!user.phone) {
        throw new NotFoundException(OTP_ERROR.USER_PHONE_NOT_FOUND);
      }

      const newOtpNumber = this.createOTP();
      const expireDate = moment().add(this.EXPIRE_MINUTE, 'm').toDate();
      const receiverNumber = `+82${query.phone}`;

      // 기존 otp 존재 유무 확인
      const existingOtp = await this.otpRepo.findOne({
        where: {
          email: user.accounts[0].email,
          isActive: true,
          action: OtpAction.SMS,
        },
      });

      if (!existingOtp) {
        // otp 존재하지 않을 경우 새로 발급
        const otp = new Otp();
        otp.email = user.accounts[0].email;
        otp.otp = newOtpNumber;
        otp.expireDate = expireDate;
        otp.action = OtpAction.SMS;

        await this.otpRepo.save(otp);

        // twilio 인증번호 발송
        client.messages
          .create({
            from: process.env.TWILIO_MY_PHONE_NUMBER,
            to: receiverNumber,
            body: `골프랑 인증번호는 ${otp.otp} 입니다.`,
          })
          .then((message) => console.log('새 인증번호 발급 완료'))
          .done();

        return { email: otp.email, expireDate };
      }

      // otp 존재할 경우 업데이트 후 재발급
      await this.otpRepo.update(
        { id: existingOtp.id },
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

  async checkSMSOTP(body) {
    try {
      // console.log('body :', body);
      // const existingOtp = await this.otpRepo.findOne({
      //   where: {
      //     otp: body.otp,
      //     // email: body.email,
      //   },
      // });
      // console.log('existingOtp :', existingOtp);
      // if (!existingOtp) {
      //   throw new NotFoundException(OTP_ERROR.OTP_NOT_FOUND);
      // }
      // return existingOtp.email;
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
