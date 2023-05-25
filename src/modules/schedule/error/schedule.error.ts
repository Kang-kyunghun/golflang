import { CoreError } from 'src/common/error/core.error';

export const SCHEDULE_ERROR = {
  ROUNDING_SCHEDULE_ALREADY_EXIST: 'roundingAlreadyExist',
  ROUNDING_SCHEDULE_NOT_FOUND: 'roundingScheduleNotFound',
  ROUNDING_USER_NOT_FOUND: 'roundingUserNotFound',
  CLUB_NOT_FOUND: 'clubNotFound',
  INVALID_USER: 'invalidUser',
};

export class ScheduleError extends CoreError {
  constructor() {
    super();
    this.errorHandle = {
      [SCHEDULE_ERROR.ROUNDING_SCHEDULE_ALREADY_EXIST]: {
        id: 'Rounding.already.exist',
        message: '이미 존재하는 라운딩 일정입니다.',
      },
      [SCHEDULE_ERROR.ROUNDING_SCHEDULE_NOT_FOUND]: {
        id: 'Rounding.schedule.not.found',
        message: '일정을 찾을 수 없습니다.',
      },
      [SCHEDULE_ERROR.ROUNDING_USER_NOT_FOUND]: {
        id: 'Rounding.user.not.found',
        message: '유저를 찾을 수 없습니다.',
      },
      [SCHEDULE_ERROR.CLUB_NOT_FOUND]: {
        id: 'Rounding.schedule.club.not.found',
        message: '클럽을 찾을 수 없습니다.',
      },
      [SCHEDULE_ERROR.INVALID_USER]: {
        id: 'Rounding.schedule.invalid.user',
        message: '권한이 없는 사용자 입니다.',
      },
    };
  }
}
