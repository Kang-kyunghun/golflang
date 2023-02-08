import { CoreError } from 'src/common/error/core.error';

export const OTP_ERROR = {
  USER_NOT_FOUND: 'userNotFound',
  USER_PHONE_NOT_FOUND: 'userPhoneNotFound',
  OTP_NOT_FOUND: 'otpNotFound',
  OTP_NOT_MATCH: 'otpNotMatch',
  OTP_EXPIRE: 'otpExpire',
};

export class OtpError extends CoreError {
  constructor() {
    super();
    this.errorHandle = {
      [OTP_ERROR.USER_NOT_FOUND]: {
        id: OTP_ERROR.USER_NOT_FOUND,
        message: '유저를 찾을 수 없습니다.',
      },
      [OTP_ERROR.USER_PHONE_NOT_FOUND]: {
        id: OTP_ERROR.USER_PHONE_NOT_FOUND,
        message: '유저의 핸드폰 번호를 찾을 수 없습니다.',
      },
      [OTP_ERROR.OTP_NOT_FOUND]: {
        id: OTP_ERROR.OTP_NOT_FOUND,
        message: 'OTP 정보를 찾을 수 없습니다.',
      },
      [OTP_ERROR.OTP_NOT_MATCH]: {
        id: OTP_ERROR.OTP_NOT_MATCH,
        message: 'OTP 정보가 올바르지 않습니다.',
      },
      [OTP_ERROR.OTP_EXPIRE]: {
        id: OTP_ERROR.OTP_EXPIRE,
        message: 'OTP의 만료시간이 지났습니다. 재요청 해주세요.',
      },
    };
  }
}
