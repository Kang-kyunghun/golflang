import { Body, Controller, Get, Patch, UseInterceptors } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RoleGuard } from 'src/common/decorator/role.decorator';
import { SwaggerDefault } from 'src/common/decorator/swagger.decorator';
import { GetUserId } from 'src/common/decorator/user.decorator';
import { PermissionRole } from 'src/common/enum/common.enum';
import { ResultFormatInterceptor } from 'src/common/interceptor/result-format.interceptor';
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
  async updateUserInfo(
    @GetUserId() userId: number,
    @Body() body: UpdateUserInfoInputDto,
  ) {
    return await this.userService.updateUserInfo(userId, body);
  }
}
