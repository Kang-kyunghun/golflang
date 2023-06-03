import { CoreError } from 'src/common/error/core.error';

export const ALARM_ERROR = {
  INVALID_USER: 'invalidUser',
  SCHEDULE_NOT_FOUND: 'scheduleNotFound',
};

export class AlarmError extends CoreError {
  constructor() {
    super();
    this.errorHandle = {
      [ALARM_ERROR.INVALID_USER]: {
        id: 'invalid.user',
        message: '권한이 없는 사용자 입니다.',
      },
      [ALARM_ERROR.SCHEDULE_NOT_FOUND]: {
        id: 'Alarm.schedule.not.found',
        message: '일정을 찾을 수 없습니다.',
      },
    };
  }
}
