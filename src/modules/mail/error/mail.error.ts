import { CoreError } from 'src/common/error/core.error';

export const MAIL_ERROR = {
  ACCOUNT_NICKNAME_ALREADY_EXIST: 'authNicknameAlreadyExist',
};

export class MailError extends CoreError {
  // constructor() {
  //   super();
  //   this.errorHandle = {
  //     [MAIL_ERROR.ACCOUNT_EMAIL_ALREADY_EXIST]: {
  //       id: 'Auth.email.already.exist',
  //       message: '중복된 이메일입니다.',
  //     },
  //   };
  // }
}
