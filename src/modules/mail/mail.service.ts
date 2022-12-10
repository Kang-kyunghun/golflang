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
import { MailError } from './error/mail.error';
import { SendResetPsEmailInputDto } from './dto/send-reset-ps-email.dto';
import { CommonService } from 'src/common/common.service';
import { AUTH_ERROR } from '../auth/error/auth.error';

const mailgun = require('mailgun-js');

const API_KEY = 'cbc44f1e2aac32a756328fa53a6e1992-bdb2c8b4-e2e2b83b';
const DOMAIN = 'sandboxa052f5ca5a5d446e81044069943f0d9f.mailgun.org';
const mailgunClient = mailgun({ apiKey: API_KEY, domain: DOMAIN });

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

  createOTP = () =>
    [0, 0, 0, 0, 0, 0].map(() => Math.floor(Math.random() * 10)).join('');

  async sendResetPsEmail(body: SendResetPsEmailInputDto): Promise<String> {
    const accountLocalRepo: Repository<Account> = this.accountRepo;
    try {
      const user = await this.userRepo.findOne({
        where: { accounts: { email: body.email } },
        relations: { accounts: true },
      });

      if (!user) {
        throw new NotFoundException(AUTH_ERROR.ACCOUNT_EMAIL_IS_NOT_EXIST);
      }

      const randomString = Math.random().toString(36).slice(2);
      const tempPassword = `${randomString}1!`;
      const encrytedPassword = await this.commonService.hash(tempPassword);

      const data = {
        from: 'mailgun@sandboxa052f5ca5a5d446e81044069943f0d9f.mailgun.org',
        to: body.email,
        subject: '골프랑 임시비밀번호 발급',
        text: `골프랑 로그인 임시 비밀번호는 ${tempPassword} 입니다`,
      };

      mailgunClient.messages().send(data, async function (error, result) {
        try {
          if (result.message === 'Queued. Thank you.') {
            const updateAccount = await accountLocalRepo.update(
              { id: user.accounts[0].id },
              { password: encrytedPassword },
            );

            if (updateAccount.affected === 1) {
              console.log('임시비밀번호 업데이트 완료');
            } else {
              console.log('임시비밀번호 업데이트 실패');
            }
          }
        } catch (error) {
          console.log('error :', error);
        }
      });

      return 'done';
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
