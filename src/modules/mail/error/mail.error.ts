import { CoreError } from 'src/common/error/core.error';

export const MAIL_ERROR = {
  ACCOUNT_EMAIL_IS_NOT_EXIST: 'authEmailIsNotExist',
};

export class MailError extends CoreError {
  constructor() {
    super();
    this.errorHandle = {
      [MAIL_ERROR.ACCOUNT_EMAIL_IS_NOT_EXIST]: {
        id: MAIL_ERROR.ACCOUNT_EMAIL_IS_NOT_EXIST,
        message: '존재하지 않는 이메일입니다.',
      },
    };
  }
}
