import { CoreError } from 'src/common/error/core.error';

export const AUTH_ERROR = {
  ACCOUNT_NICKNAME_ALREADY_EXIST: 'authNicknameAlreadyExist',
  ACCOUNT_EMAIL_ALREADY_EXIST: 'authEmailAlreadyExist',
  ACCOUNT_PASSWORD_WAS_WRONG: 'authPasswordWasWrong',
  ACCOUNT_ACCOUNT_NOT_FOUND: 'authAccountNotFound',
  ACCOUNT_SOCIAL_DATA_ERROR: 'authSocialDataError',
  ACCOUNT_LOGIN_FAILED: 'authAccountLoginFailed',
  ACCOUNT_PHONE_ALREADY_EXIST: 'authPhoneAlreadyExist',
  ACCESS_TOKEN_ERROR: 'accessTokenError',
  REFRESH_TOKEN_EXPIRED: 'refreshTokenExpired',
  REFRESH_TOKEN_NOT_FOUND: 'refreshTokenNotFound',
};

export class AuthError extends CoreError {
  constructor() {
    super();
    this.errorHandle = {
      [AUTH_ERROR.ACCOUNT_EMAIL_ALREADY_EXIST]: {
        id: AUTH_ERROR.ACCOUNT_EMAIL_ALREADY_EXIST,
        message: '중복된 이메일입니다.',
      },
      [AUTH_ERROR.ACCOUNT_NICKNAME_ALREADY_EXIST]: {
        id: AUTH_ERROR.ACCOUNT_NICKNAME_ALREADY_EXIST,
        message: '중복된 닉네임입니다.',
      },
      [AUTH_ERROR.ACCOUNT_ACCOUNT_NOT_FOUND]: {
        id: AUTH_ERROR.ACCOUNT_ACCOUNT_NOT_FOUND,
        message: '사용자의 계정을 찾을 수 없습니다.',
      },
      [AUTH_ERROR.ACCOUNT_PASSWORD_WAS_WRONG]: {
        id: AUTH_ERROR.ACCOUNT_PASSWORD_WAS_WRONG,
        message: '비밀번호가 틀렸습니다.',
      },
      [AUTH_ERROR.ACCOUNT_SOCIAL_DATA_ERROR]: {
        id: AUTH_ERROR.ACCOUNT_SOCIAL_DATA_ERROR,
        message: '소셜 정보를 가져오는 도중 에러가 발생하였습니다',
      },
      [AUTH_ERROR.ACCOUNT_LOGIN_FAILED]: {
        id: AUTH_ERROR.ACCOUNT_LOGIN_FAILED,
        message: '로그인을 하는 도중 오류가 발생하였습니다.',
      },
      [AUTH_ERROR.ACCOUNT_PHONE_ALREADY_EXIST]: {
        id: AUTH_ERROR.ACCOUNT_PHONE_ALREADY_EXIST,
        message: '이미 가입된 휴대폰 번호입니다.',
      },
      [AUTH_ERROR.ACCESS_TOKEN_ERROR]: {
        id: AUTH_ERROR.ACCESS_TOKEN_ERROR,
        message: '접근 권한이 없습니다.',
      },
      [AUTH_ERROR.REFRESH_TOKEN_EXPIRED]: {
        id: AUTH_ERROR.REFRESH_TOKEN_EXPIRED,
        message: 'refreshToken이 만료되었습니다.',
      },
      [AUTH_ERROR.REFRESH_TOKEN_NOT_FOUND]: {
        id: AUTH_ERROR.REFRESH_TOKEN_NOT_FOUND,
        message: 'refreshToken이 존재하지 않습니다.',
      },
    };
  }
}
