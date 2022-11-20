import { BadRequestException, HttpException } from '@nestjs/common';
import { ClassConstructor, plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

export interface FormDataParse<T> {
  parse(): Promise<T>;
}

export class FormDataValidate<T> implements FormDataParse<T> {
  classConstructor: ClassConstructor<T>;
  data: any;
  constructor(inputConstructor, jsonData) {
    this.classConstructor = inputConstructor;
    this.data = jsonData;
  }

  public async parse(): Promise<T> {
    if (!this.data) {
      return new this.classConstructor();
    }

    const result = plainToClass(this.classConstructor, JSON.parse(this.data));

    if (!result) {
      throw new HttpException(
        {
          id: 'Class.validate.fail',
          message: '해당 작업을 진행할 수 없습니다.',
        },
        400,
      );
    }

    const errors = await validate(result as unknown as object);

    if (errors.length > 0) {
      throw new BadRequestException({
        id: 'Validate.fail',
        message: errors.map((v) => Object.values(v.constraints).toString()),
        error: 'Bad Request',
      });
    }

    return result;
  }
}
