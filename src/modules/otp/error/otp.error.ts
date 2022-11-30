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
        id: 'Otp.user.not.found',
        message: '유저를 찾을 수 없습니다.',
      },
      [OTP_ERROR.USER_PHONE_NOT_FOUND]: {
        id: 'Otp.user.phone.not.found',
        message: '유저의 핸드폰 번호를 찾을 수 없습니다.',
      },
      [OTP_ERROR.OTP_NOT_FOUND]: {
        id: 'Otp.not.found',
        message: 'OTP 정보를 찾을 수 없습니다.',
      },
      [OTP_ERROR.OTP_NOT_MATCH]: {
        id: 'Otp.not.match',
        message: 'OTP 정보가 올바르지 않습니다.',
      },
      [OTP_ERROR.OTP_EXPIRE]: {
        id: 'Otp.expire',
        message: 'OTP의 만료시간이 지났습니다. 재요청 해주세요.',
      },
    };
  }
}
