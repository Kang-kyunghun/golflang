import { CoreError } from 'src/common/error/core.error';

export const ROUNDING_ERROR = {
  ROUNDING_ALREADY_EXIST: 'roundingAlreadyExist',
};

export class RoundingError extends CoreError {
  constructor() {
    super();
    this.errorHandle = {
      [ROUNDING_ERROR.ROUNDING_ALREADY_EXIST]: {
        id: 'Rounding.already.exist',
        message: '이미 존재하는 라운딩 일정입니다.',
      },
    };
  }
}
