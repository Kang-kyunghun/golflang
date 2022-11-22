import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, Matches } from 'class-validator';
import { Provider } from '../enum/user.enum';
import { SignupOutputDto } from './signup-dto';

export class LoginInputDto {
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

  @IsString()
  @IsOptional()
  @ApiProperty({ description: '카카오 ACCESS TOKEN' })
  kakaoAccessToken: string;
}

export class LoginOutputDto extends PickType(SignupOutputDto, [
  'accessToken',
  'account',
]) {}
