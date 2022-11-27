import { CoreError } from 'src/common/error/core.error';

export const OTP_ERROR = {
  USER_NOT_FOUND: 'userNotFound',
  USER_PHONE_NOT_FOUND: 'userPhoneNotFound',
  OTP_NOT_FOUND: 'otpNotFound',
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
    };
  }
}
