import { CoreError } from 'src/common/error/core.error';

export const USER_ERROR = {
  USER_NOT_FOUND: 'userNotFound',
};

export class UserError extends CoreError {
  constructor() {
    super();
    this.errorHandle = {
      [USER_ERROR.USER_NOT_FOUND]: {
        id: USER_ERROR.USER_NOT_FOUND,
        message: '해당 유저를 찾을 수 없습니다.',
      },
    };
  }
}
