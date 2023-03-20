import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SwaggerDefault } from 'src/common/decorator/swagger.decorator';
import { PingService } from './ping.service';

@ApiTags('PING')
@Controller('ping')
export class PingController {
  constructor(private pingService: PingService) { }

  @Get()
  @SwaggerDefault('API Health Check')
  ping() {
    return this.pingService.ping()
  }
}
