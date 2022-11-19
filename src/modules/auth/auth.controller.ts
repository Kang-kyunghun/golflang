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
import { LoginInputDto, LoginOutputDto } from 'src/modules/user/dto/login-dto';
import {
  SignupInputDto,
  SignupOutputDto,
} from 'src/modules/user/dto/signup-dto';
import { Provider } from '../user/enum/user.enum';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';

@ApiTags('AUTH')
@Controller('auth')
@UseInterceptors(ResultFormatInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @SwaggerDefault('로컬 회원가입', SignupOutputDto, '로컬 회원가입')
  async signup(@Body() body: SignupInputDto): Promise<SignupOutputDto> {
    return await this.authService.signup(body);
  }

  @Post('login/:provider')
  @UseGuards(LoginGuard)
  @SwaggerDefault(
    '소셜 & 로컬 통합 로그인',
    LoginOutputDto,
    '소셜 로그인 추후 개발 진행 예정',
  )
  @ApiParam({
    name: 'provider',
    required: true,
    description: '로그인 경로(카카오, 애플, 로컬)',
    type: 'enum',
    enum: Provider,
  })
  @ApiBody({ type: LoginInputDto })
  async login(@Req() req: Request): Promise<LoginOutputDto> {
    return await this.authService.login(req['guard']);
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
