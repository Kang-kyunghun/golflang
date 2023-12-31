import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class SendResetPasswordEmailInputDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ description: '이메일' })
  email: string;
}
