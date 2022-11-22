import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { User } from '../entity/user.entity';

export class CheckNicknameInputDto {
  @IsString()
  @ApiProperty({ description: '닉네임' })
  nickname: string;
}

export class CheckNicknameOutputDto {
  @ApiProperty({ description: '중복된 닉네임인지 여부' })
  isDuplicatedNickname: boolean;
}
