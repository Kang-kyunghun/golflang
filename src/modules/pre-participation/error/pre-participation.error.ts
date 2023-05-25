import { CoreError } from 'src/common/error/core.error';

export const PRE_PARTICIPATION_ERROR = {
  SCHEDULE_NOT_FOUND: 'scheduleNotFound',
  INVALID_USER: 'invalidUser',
  FORBIDDEN: 'forbidden',
};

export class PreParticipationError extends CoreError {
  constructor() {
    super();
    this.errorHandle = {
      [PRE_PARTICIPATION_ERROR.SCHEDULE_NOT_FOUND]: {
        id: 'Pre-Participation.schedule.not.found',
        message: '일정을 찾을 수 없습니다.',
      },
      [PRE_PARTICIPATION_ERROR.INVALID_USER]: {
        id: 'Pre-Participation.invalid.user',
        message: '유저를 찾을 수 없습니다.',
      },
      [PRE_PARTICIPATION_ERROR.FORBIDDEN]: {
        id: 'Pre-Participation.forbidden',
        message: '권한이 없습니다.',
      },
    };
  }
}
