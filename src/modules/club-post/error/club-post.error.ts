import { CoreError } from 'src/common/error/core.error';

export const CLUB_POST_ERROR = {
  CLUB_POST_NOT_FOUND: 'clubPostNotFound',
  CLUB_POST_PERMISSION_DENIED: 'clubPostPermissionDenied',
};

export class ClubPostError extends CoreError {
  constructor() {
    super();
    this.errorHandle = {
      [CLUB_POST_ERROR.CLUB_POST_NOT_FOUND]: {
        id: 'club-post.not.found',
        message: '클럽 게시글을 찾을 수 없습니다.',
      },
      [CLUB_POST_ERROR.CLUB_POST_PERMISSION_DENIED]: {
        id: 'club-post.permission.denied',
        message: '클럽 게시글에 대해 권한이 없습니다.',
      },
    };
  }
}
