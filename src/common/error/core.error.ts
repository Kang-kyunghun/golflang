import { ErrorEntity } from '../entity/error.entity';

export class CoreError {
  protected api: string;
  protected errorHandle: Object;
  protected status: number;

  errorHandler(message): ErrorEntity {
    const error = this.errorHandle[message];

    if (!error) {
      return {
        id: `Out.of.control.error`,
        message,
      };
    }

    return error;
  }
}
