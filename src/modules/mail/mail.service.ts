import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from '../user/entity/account.entity';
import { User } from '../user/entity/user.entity';
import { MailError, MAIL_ERROR } from './error/mail.error';
import { SendResetPasswordEmailInputDto } from './dto/send-reset-ps-email.dto';
import { CommonService } from 'src/common/common.service';

const mailgun = require('mailgun-js');

const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY;
const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN;

const mailgunClient = mailgun({
  apiKey: MAILGUN_API_KEY,
  domain: MAILGUN_DOMAIN,
});

@Injectable()
export class MailService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Account)
    private readonly accountRepo: Repository<Account>,
    private readonly logger: Logger,
    private readonly mailError: MailError,
    private readonly commonService: CommonService,
  ) {}

  async sendResetPasswordEmail(
    body: SendResetPasswordEmailInputDto,
  ): Promise<boolean> {
    try {
      const user = await this.userRepo.findOne({
        where: { account: { email: body.email } },
        relations: { account: true },
      });

      if (!user) {
        throw new NotFoundException(MAIL_ERROR.ACCOUNT_EMAIL_IS_NOT_EXIST);
      }

      const randomString = Math.random().toString(36).slice(2);
      const tempPassword = `${randomString}1!`;
      const encrytedPassword = await this.commonService.hash(tempPassword);

      const data = {
        from: `mailgun@${MAILGUN_DOMAIN}`,
        to: body.email,
        subject: '[골프랑 임시비밀번호]',
        text: `골프랑 로그인 임시 비밀번호는 ${tempPassword} 입니다`,
      };

      const result = await mailgunClient.messages().send(data);

      if (result) {
        console.log(`임시비밀번호 이메일 발송 완료 to ${body.email}`);

        const updateAccount = await this.accountRepo.update(
          { id: user.account.id },
          { password: encrytedPassword, isTempPassword: true },
        );

        if (updateAccount.affected !== 1) {
          console.log(`임시비밀번호 업데이트 실패  ${body.email}`);
          return false;
        }
        return true;
      }

      return false;
    } catch (error) {
      this.logger.error(error);

      const statusCode = error.response
        ? error.response.statusCode
        : HttpStatus.BAD_REQUEST;

      throw new HttpException(
        this.mailError.errorHandler(error.message),
        statusCode,
      );
    }
  }
}
