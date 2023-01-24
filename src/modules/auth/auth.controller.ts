import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UseGuards,
  Req,
  Request,
  Query,
  UploadedFiles,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { LoginGuard } from 'src/modules/auth/guard/login.guard';
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
} from 'src/modules/user/dto/login-dto';
import {
  SignupInputDto,
  SignupOutputDto,
} from 'src/modules/user/dto/signup-dto';
import { AuthService } from './auth.service';
import { UploadSingleImage } from '../upload-file/decorator/upload-file.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { FormDataValidate } from 'src/util/json.interceptor';
import { Provider } from './enum/account.enum';
import {
  RefreshTokenOutputDto,
  RefreshTokenQueryDto,
} from './dto/refresh-token.dto';
import { Account } from '../user/entity/account.entity';
import { WithdrawAccountQueryDto } from './dto/withdraw-account.dto';
import { LogoutQueryDto } from './dto/logout.dto';

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
    @Body() body,
    @UploadedFile() file: Express.MulterS3.File,
  ): Promise<Account> {
    body = await new FormDataValidate(SignupInputDto, body.data).parse();

    return await this.authService.signup(body, file);
  }

  @Post('login/local')
  @SwaggerDefault('로컬 로그인', LoginOutputDto, '로컬 로그인')
  async loginLocal(@Body() body: LocalLoginInputDto): Promise<LoginOutputDto> {
    return await this.authService.loginLocal(body);
  }

  @Post('login/oauth/:provider')
  @UseGuards(LoginGuard)
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
    return await this.authService.loginOAuth(req['guard'], req['body']);
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

  @Get('access-token')
  @SwaggerDefault(
    'access token 발급',
    RefreshTokenOutputDto,
    'access token 발급',
  )
  async refreshToken(
    @Query() query: RefreshTokenQueryDto,
  ): Promise<RefreshTokenOutputDto> {
    return await this.authService.refreshToken(query);
  }

  @Delete('withdrawal')
  @SwaggerDefault('회원탈퇴', Boolean, '회원탈퇴')
  async withdrawAccount(
    @Query() query: WithdrawAccountQueryDto,
  ): Promise<boolean> {
    return await this.authService.withdrawAccount(query);
  }

  @Patch('logout')
  @SwaggerDefault('로그아웃', Boolean, '로그아웃')
  async logout(@Query() query: LogoutQueryDto): Promise<boolean> {
    return await this.authService.logout(query);
  }
}
