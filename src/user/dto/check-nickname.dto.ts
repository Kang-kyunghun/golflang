import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { User } from '../entity/user.entity';

export class CheckNicknameInputDto {
  @IsString()
  @ApiProperty({ description: '닉네임' })
  nickname: string;
}

export class CheckNicknameOutputDto {
  @ApiProperty({ description: '해당 닉네임 사용할 수 있는지 여부' })
  isAble: boolean;
}
