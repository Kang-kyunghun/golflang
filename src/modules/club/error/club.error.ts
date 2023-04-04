import { CoreError } from 'src/common/error/core.error';

export const CLUB_ERROR = {
  CLUB_NOT_FOUND: 'clubNotFound',
};

export class ClubError extends CoreError {
  constructor() {
    super();
    this.errorHandle = {
      [CLUB_ERROR.CLUB_NOT_FOUND]: {
        id: 'club.not.found',
        message: '클럽을 찾을 수 없습니다.',
      },
    };
  }
}
