import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GetUserId } from 'src/common/decorator/user.decorator';
import { ResultFormatInterceptor } from 'src/common/interceptor/result-format.interceptor';
import { UserService } from './user.service';

@ApiTags('USER')
@Controller('user')
@UseInterceptors(ResultFormatInterceptor)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('detail')
  async getUserDetail() {
    return await this.userService.getUserDetail();
  }
}
