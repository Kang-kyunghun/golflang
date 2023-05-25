import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AlarmService } from './alarm.service';
import { CreateAlarmInputDto } from './dto/create-alarm.dto';
import { UpdateAlarmDto } from './dto/update-alarm.dto';

@ApiTags('ALARM')
@Controller('alarm')
export class AlarmController {
  constructor(private readonly alarmService: AlarmService) {}
}
