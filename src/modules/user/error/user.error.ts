import { CoreError } from 'src/common/error/core.error';

export const USER_ERROR = {
  USER_NOT_FOUND: 'userNotFound',
  USER_NICKNAME_ALREADY_EXIST: 'userNicknameAlreadyExist',
};

export class UserError extends CoreError {
  constructor() {
    super();
    this.errorHandle = {
      [USER_ERROR.USER_NOT_FOUND]: {
        id: USER_ERROR.USER_NOT_FOUND,
        message: '해당 유저를 찾을 수 없습니다.',
      },
      [USER_ERROR.USER_NICKNAME_ALREADY_EXIST]: {
        id: USER_ERROR.USER_NICKNAME_ALREADY_EXIST,
        message: '해당 닉네임은 이미 다른 사용자가 사용중입니다.',
      },
    };
  }
}
