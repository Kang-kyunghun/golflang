import {
  Body,
  Controller,
  Get,
  Patch,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RoleGuard } from 'src/common/decorator/role.decorator';
import { SwaggerDefault } from 'src/common/decorator/swagger.decorator';
import { GetUserId } from 'src/common/decorator/user.decorator';
import { PermissionRole } from 'src/common/enum/common.enum';
import { ResultFormatInterceptor } from 'src/common/interceptor/result-format.interceptor';
import { FormDataValidate } from 'src/util/json.interceptor';
import { UploadSingleImage } from '../upload-file/decorator/upload-file.decorator';
import { GetUserDetailOutputDto } from './dto/get-user-detail.dto';
import { UpdateUserInfoInputDto } from './dto/update-user-info.dto';
import { UserService } from './user.service';

@ApiTags('USER')
@Controller('user')
@UseInterceptors(ResultFormatInterceptor)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('detail')
  @RoleGuard(PermissionRole.USER)
  @SwaggerDefault('회원 상세 정보 조회', GetUserDetailOutputDto)
  async getUserDetail(
    @GetUserId() userId: number,
  ): Promise<GetUserDetailOutputDto> {
    return await this.userService.getUserDetail(userId);
  }

  @Patch()
  @RoleGuard(PermissionRole.USER)
  @SwaggerDefault('회원 정보 수정', 'done')
  @UploadSingleImage('profileImage')
  async updateUserInfo(
    @Body() body,
    @GetUserId() userId: number,
    @UploadedFile() file: Express.MulterS3.File,
  ) {
    body = await new FormDataValidate(
      UpdateUserInfoInputDto,
      body.data,
    ).parse();

    return await this.userService.updateUserInfo(userId, body, file);
  }
}
