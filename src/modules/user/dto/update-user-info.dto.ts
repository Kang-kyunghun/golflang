import { PickType } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import { SignupInputDto } from './signup-dto';

export class UpdateUserInfoInputDto extends PartialType(
  PickType(SignupInputDto, [
    'nickname',
    'birthday',
    'gender',
    'address',
    'addressDetail',
    'avgHitScore',
  ]),
) {}
