import { JwtAuthGuard } from './../auth/guard/jwt.guard';
import {
  Body,
  Controller,
  Get,
  Patch,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiBody, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { RoleGuard } from 'src/common/decorator/role.decorator';
import { SwaggerDefault } from 'src/common/decorator/swagger.decorator';
import { GetUserId } from 'src/common/decorator/user.decorator';
import { PermissionRole } from 'src/common/enum/common.enum';
import { ResultFormatInterceptor } from 'src/common/interceptor/result-format.interceptor';
import {
  GetUserDetailOutputDto,
  GetUserListQueryDto,
  UserOutputDto,
  UserListOutputDto,
  UpdateUserInfoInputDto,
} from './dto';
import { UploadSingleImage } from '../upload-file/decorator/upload-file.decorator';
import { UserService } from './user.service';

@ApiTags('USER')
@Controller('user')
@UseGuards(JwtAuthGuard)
// @UseInterceptors(ResultFormatInterceptor)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('detail')
  // @RoleGuard(PermissionRole.USER)
  @SwaggerDefault('회원 상세 정보 조회', GetUserDetailOutputDto)
  getUserDetail(
    @GetUserId() userId: number,
  ): Promise<{ user: GetUserDetailOutputDto; hasTempPassword: boolean }> {
    return this.userService.getUserDetail(userId);
  }

  @Patch()
  // @RoleGuard(PermissionRole.USER)
  @SwaggerDefault('회원 정보 수정')
  @UploadSingleImage('profileImage')
  @ApiBody({ type: UpdateUserInfoInputDto })
  updateUserInfo(
    @Body() body: UpdateUserInfoInputDto,
    @GetUserId() userId: number,
    @UploadedFile() file: Express.MulterS3.File,
  ): Promise<GetUserDetailOutputDto> {
    return this.userService.updateUserInfo(userId, body, file);
  }

  @Get('list')
  @ApiOperation({
    summary: '서비스 이용자 목록 조회',
    description: 'id 또는 닉네임으로 서비스 이용자 목록를 조회합니다.',
  })
  @ApiOkResponse({
    description: '요청 성공 응답',
    type: [UserOutputDto],
    isArray: false,
  })
  async getUserList(
    @Query() query: GetUserListQueryDto,
  ): Promise<UserListOutputDto> {
    return await this.userService.getUserList(query);
  }
}
