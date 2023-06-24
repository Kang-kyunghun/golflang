import { CoreError } from 'src/common/error/core.error';

export const CLUB_ERROR = {
  CLUB_NOT_FOUND: 'clubNotFound',
  CLUB_PERMISSION_DENIED: 'clubPermissionDenied',
  CLUB_ALREADY_JOINED: 'clubAlreadyJoined',
};

export class ClubError extends CoreError {
  constructor() {
    super();
    this.errorHandle = {
      [CLUB_ERROR.CLUB_NOT_FOUND]: {
        id: 'club.not.found',
        message: '클럽을 찾을 수 없습니다.',
      },
      [CLUB_ERROR.CLUB_PERMISSION_DENIED]: {
        id: 'club.permission.denied',
        message: '권한이 없습니다.',
      },
      [CLUB_ERROR.CLUB_ALREADY_JOINED]: {
        id: 'club.already.joined',
        message: '이미 가입 신청한 사용자입니다.',
      },
    };
  }
}
