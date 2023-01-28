import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsString } from 'class-validator';
import { transQueryToBoolean } from 'src/common/function/transQueryToBoolean';
import { LoginOutputDto } from 'src/modules/user/dto/login-dto';

export class RefreshTokenQueryDto {
  @IsString()
  @ApiProperty({ description: 'refreshToken (쿠키 or 세션에 저장된 값)' })
  refreshToken: string;

  @IsString()
  @ApiProperty({ description: 'Account uid' })
  accountUid: string;
}

export class RefreshTokenOutputDto extends PartialType(LoginOutputDto) {}
