import { CoreError } from 'src/common/error/core.error';

export const INVITATION_ERROR = {
  USER_ALREADY_INVITED: 'userAlreadyInvited',
  SCHEDULE_NOT_FOUND: 'scheduleNotFound',
  HOST_USER_NOT_FOUND: 'hostUserNotFound',
};

export class InvitationError extends CoreError {
  constructor() {
    super();
    this.errorHandle = {
      [INVITATION_ERROR.USER_ALREADY_INVITED]: {
        id: 'Invitation.user.already.invited',
        message: '이미 초대된 유저입니다.',
      },
      [INVITATION_ERROR.SCHEDULE_NOT_FOUND]: {
        id: 'Invitation.schedule.not.found',
        message: '일정을 찾을 수 없습니다.',
      },
      [INVITATION_ERROR.HOST_USER_NOT_FOUND]: {
        id: 'Invitation.host.user.not.found',
        message: '유저를 찾을 수 없습니다.',
      },
    };
  }
}
