import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, Matches } from 'class-validator';

export class LocalLoginInputDto {
  @IsEmail()
  @IsOptional()
  @ApiProperty({
    description: '이메일, provider가 twitter, local일 때만 필요',
    required: false,
  })
  email?: string;

  @IsString()
  @IsOptional()
  @Matches(
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[~!@#$%^&*_+=-])[A-Za-z\d~!@#$%^&*_+=-]{8,}$/,
  )
  @ApiProperty({
    description: '비밀번호, provider가 local 일때만 필요',
    required: false,
  })
  password?: string;
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
