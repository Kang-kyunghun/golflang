import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { LoginOutputDto } from 'src/modules/auth/dto/login-dto';

export class RefreshTokenQueryDto {
  @IsString()
  @ApiProperty({ description: '리프레시 토큰', required: true })
  refreshToken: string;
}

export class RefreshTokenOutputDto extends PickType(LoginOutputDto, [
  'accessToken',
]) {}
