import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsString } from 'class-validator';
import { transQueryToBoolean } from 'src/common/function/transQueryToBoolean';
import { LoginOutputDto } from 'src/modules/auth/dto/login-dto';

export class RefreshTokenQueryDto {
  @IsString()
  @ApiProperty({ description: '리프레시 토큰' })
  refreshToken: string;
}

export class RefreshTokenOutputDto extends PartialType(LoginOutputDto) {}
