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
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { RoleGuard } from 'src/common/decorator/role.decorator';
import { SwaggerDefault } from 'src/common/decorator/swagger.decorator';
import { GetUserId } from 'src/common/decorator/user.decorator';
import { PermissionRole } from 'src/common/enum/common.enum';
import { ResultFormatInterceptor } from 'src/common/interceptor/result-format.interceptor';

import { UploadSingleImage } from '../upload-file/decorator/upload-file.decorator';
import { GetUserDetailOutputDto } from './dto/get-user-detail.dto';
import {
  SearchUsersOutputDto,
  SearchUsersQueryDto,
} from './dto/search-users.dto';
import { UpdateUserInfoInputDto } from './dto/update-user-info.dto';
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
  getUserDetail(@GetUserId() userId?: number): Promise<GetUserDetailOutputDto> {
    return this.userService.getUserDetail(userId);
  }

  @Patch()
  // @RoleGuard(PermissionRole.USER)
  @SwaggerDefault('회원 정보 수정')
  @UploadSingleImage('profileImage')
  @ApiBody({ type: UpdateUserInfoInputDto })
  updateUserInfo(
    @Body() body,
    @GetUserId() userId: number,
    @UploadedFile() file: Express.MulterS3.File,
  ) {
    return this.userService.updateUserInfo(userId, body, file);
  }

  @Get('search')
  @SwaggerDefault(
    '유저 검색',
    SearchUsersOutputDto,
    'id 또는 닉네임으로 이용자 검색',
  )
  searchUsers(
    @Query() query: SearchUsersQueryDto,
  ): Promise<SearchUsersOutputDto> {
    return this.userService.searchUsers(query);
  }
}
