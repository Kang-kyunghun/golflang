import {
  Controller,
  Post,
  Body,
  Patch,
  Delete,
  UseInterceptors,
  UseGuards,
  Req,
  Request,
  UploadedFile,
} from '@nestjs/common';
import { ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';
import { OAuthLoginGuard } from 'src/modules/auth/guard/oAuthLogin.guard';
import { RoleGuard } from 'src/common/decorator/role.decorator';
import { SwaggerDefault } from 'src/common/decorator/swagger.decorator';
import { PermissionRole } from 'src/common/enum/common.enum';
import { ResultFormatInterceptor } from 'src/common/interceptor/result-format.interceptor';
import {
  CheckNicknameInputDto,
  CheckNicknameOutputDto,
} from 'src/modules/user/dto/check-nickname.dto';
import {
  LocalLoginInputDto,
  LoginOutputDto,
  OAuthLoginInputDto,
} from 'src/modules/auth/dto/login-dto';
import {
  SignupInputDto,
  SignupOutputDto,
} from 'src/modules/user/dto/signup-dto';
import { AuthService } from './auth.service';
import { UploadSingleImage } from '../upload-file/decorator/upload-file.decorator';

import { Provider } from './enum/account.enum';
import {
  RefreshTokenOutputDto as AccessTokenOutputDto,
  RefreshTokenQueryDto as AccessTokenQueryDto,
} from './dto/refresh-token.dto';

import { GetUserId } from 'src/common/decorator/user.decorator';
import { JwtAuthGuard } from './guard/jwt.guard';

@ApiTags('AUTH')
@Controller('auth')
@UseInterceptors(ResultFormatInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @SwaggerDefault('로컬 회원가입', SignupOutputDto, '로컬 회원가입')
  @UploadSingleImage('profileImage')
  @ApiBody({ type: SignupInputDto })
  async signup(
    @Body() body: SignupInputDto,
    @UploadedFile() file?: Express.MulterS3.File,
  ): Promise<LoginOutputDto> {
    return await this.authService.signup(body, file);
  }

  @Post('login/local')
  @SwaggerDefault('로컬 로그인', LoginOutputDto, '로컬 로그인')
  async loginLocal(@Body() body: LocalLoginInputDto): Promise<LoginOutputDto> {
    return await this.authService.loginLocal(body);
  }

  @Post('login/oauth/:provider')
  @UseGuards(OAuthLoginGuard)
  @SwaggerDefault(
    '소셜 로그인',
    LoginOutputDto,
    '소셜 로그인 & 최초 소셜 로그인시 자동 회원가입',
  )
  @ApiParam({
    name: 'provider',
    required: true,
    description: '로그인 경로(카카오, 애플)',
    type: 'enum',
    enum: Provider,
  })
  @ApiBody({ type: OAuthLoginInputDto })
  async loginOAuth(@Req() req: Request): Promise<LoginOutputDto> {
    return await this.authService.loginOAuth(req['guard'], req['params']);
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

  @Post('access-token')
  @SwaggerDefault('accessToken 재발급 ', AccessTokenOutputDto)
  async accessToken(
    @Body() body: AccessTokenQueryDto,
  ): Promise<AccessTokenOutputDto> {
    return await this.authService.accessToken(body);
  }

  @Delete('withdrawal')
  // @RoleGuard(PermissionRole.USER)
  @UseGuards(JwtAuthGuard)
  @SwaggerDefault('회원탈퇴', Boolean, '회원탈퇴')
  async withdrawAccount(@GetUserId() userId: number): Promise<boolean> {
    return await this.authService.withdrawAccount(userId);
  }

  @Patch('logout')
  @UseGuards(JwtAuthGuard)
  // @RoleGuard(PermissionRole.USER)
  @SwaggerDefault('로그아웃', Boolean, '로그아웃')
  async logout(@GetUserId() userId: number): Promise<boolean> {
    return await this.authService.logout(userId);
  }
}
