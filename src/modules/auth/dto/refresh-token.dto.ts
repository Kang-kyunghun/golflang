import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsString } from 'class-validator';
import { transQueryToBoolean } from 'src/common/function/transQueryToBoolean';
import { LoginOutputDto } from 'src/modules/user/dto/login-dto';

export class RefreshTokenQueryDto {
  @IsBoolean()
  @ApiProperty({ description: '자동 로그인 여부 (로그인 시 유저가 체크)' })
  @Transform(({ value }) => transQueryToBoolean(value))
  isAutoLogin: boolean = false;

  @IsString()
  @ApiProperty({ description: 'refreshToken (쿠키 or 세션에 저장된 값)' })
  refreshToken: string;

  @IsString()
  @ApiProperty({ description: 'Account uid' })
  accountUid: string;
}

export class RefreshTokenOutputDto extends PartialType(LoginOutputDto) {}
