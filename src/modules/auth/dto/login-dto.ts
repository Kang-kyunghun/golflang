import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class LocalLoginInputDto {
  @IsEmail()
  @ApiProperty({ required: true })
  email: string;

  @IsString()
  @ApiProperty({ required: true })
  password: string;
}

export class OAuthLoginInputDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ description: '카카오 ACCESS TOKEN' })
  kakaoAccessToken: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: '애플 IDENTITY TOKEN' })
  appleIdentityToken: string;
}

export class LoginOutputDto {
  @ApiProperty({ description: 'accessToken' })
  accessToken: string;

  @IsOptional()
  @ApiProperty({
    description:
      'refreshToken : refreshToken이 만료됐을시만 새로 발급하여 반환',
  })
  refreshToken?: string;
}
