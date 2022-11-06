import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RoleGuard } from 'src/common/decorator/role.decorator';
import { SwaggerDefault } from 'src/common/decorator/swagger.decorator';
import { PermissionRole } from 'src/common/enum/common.enum';
import { ResultFormatInterceptor } from 'src/common/interceptor/result-format.interceptor';
import {
  CheckNicknameInputDto,
  CheckNicknameOutputDto,
} from 'src/user/dto/check-nickname.dto';
import { LoginInputDto, LoginOutputDto } from 'src/user/dto/login-dto';
import { SignupInputDto, SignupOutputDto } from 'src/user/dto/signup-dto';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';

@ApiTags('AUTH')
@Controller('auth')
@UseInterceptors(ResultFormatInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @SwaggerDefault('회원가입', SignupOutputDto)
  async signup(@Body() body: SignupInputDto): Promise<SignupOutputDto> {
    return await this.authService.signup(body);
  }

  @Post('login')
  @SwaggerDefault(
    '소셜 & 로컬 통합 로그인',
    LoginOutputDto,
    '소셜 로그인 추후 개발 진행 예정',
  )
  async login(@Body() body: LoginInputDto): Promise<LoginOutputDto> {
    return await this.authService.login(body);
  }

  @Post('check/nickname')
  @SwaggerDefault(
    '닉네임 중복 확인',
    CheckNicknameOutputDto,
    'T : 닉네임 사용 가능 / F : 닉네임 사용 불가능',
  )
  async checkNickname(
    @Body() body: CheckNicknameInputDto,
  ): Promise<CheckNicknameOutputDto> {
    return await this.authService.checkNickname(body);
  }
}
