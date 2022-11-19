import { CoreError } from 'src/common/error/core.error';

export const USER_ERROR = {};

export class UserError extends CoreError {
  constructor() {
    super();
    this.errorHandle = {};
  }
}
