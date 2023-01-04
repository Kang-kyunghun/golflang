import { CoreError } from 'src/common/error/core.error';

export const AUTH_ERROR = {
  ACCOUNT_NICKNAME_ALREADY_EXIST: 'authNicknameAlreadyExist',
  ACCOUNT_EMAIL_ALREADY_EXIST: 'authEmailAlreadyExist',
  ACCOUNT_PASSWORD_WAS_WRONG: 'authPasswordWasWrong',
  ACCOUNT_ACCOUNT_NOT_FOUND: 'authAccountNotFound',
  ACCOUNT_SOCIAL_DATA_ERROR: 'authSocialDataError',
  ACCOUNT_LOGIN_FAILED: 'authAccountLoginFailed',
  ACCOUNT_EMAIL_IS_NOT_EXIST: 'authEmailIsNotExist',
  ACCOUNT_PHONE_ALREADY_EXIST: 'authPhoneAlreadyExist',
};

export class AuthError extends CoreError {
  constructor() {
    super();
    this.errorHandle = {
      [AUTH_ERROR.ACCOUNT_EMAIL_ALREADY_EXIST]: {
        id: 'Auth.email.already.exist',
        message: '중복된 이메일입니다.',
      },
      [AUTH_ERROR.ACCOUNT_NICKNAME_ALREADY_EXIST]: {
        id: 'Auth.nickname.already.exist',
        message: '중복된 닉네임입니다.',
      },
      [AUTH_ERROR.ACCOUNT_ACCOUNT_NOT_FOUND]: {
        id: 'Auth.account.not.found',
        message: '사용자의 계정을 찾을 수 없습니다.',
      },
      [AUTH_ERROR.ACCOUNT_PASSWORD_WAS_WRONG]: {
        id: 'Auth.password.was.wrong',
        message: '비밀번호가 틀렸습니다.',
      },
      [AUTH_ERROR.ACCOUNT_SOCIAL_DATA_ERROR]: {
        id: 'Auth.social.data.error',
        message: '소셜 정보를 가져오는 도중 에러가 발생하였습니다',
      },
      [AUTH_ERROR.ACCOUNT_LOGIN_FAILED]: {
        id: 'Auth.account.login.failed',
        message: '로그인을 하는 도중 오류가 발생하였습니다.',
      },
      [AUTH_ERROR.ACCOUNT_EMAIL_IS_NOT_EXIST]: {
        id: 'Auth.account.email.is.not.exist',
        message: '존재하지 않는 이메일입니다.',
      },
      [AUTH_ERROR.ACCOUNT_PHONE_ALREADY_EXIST]: {
        id: 'Auth.phone.already.exist',
        message: '이미 가입된 휴대폰 번호입니다.',
      },
    };
  }
}
