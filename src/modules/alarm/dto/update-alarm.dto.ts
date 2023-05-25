import { PartialType } from '@nestjs/mapped-types';
import { CreateAlarmInputDto } from './create-alarm.dto';

export class UpdateAlarmDto extends PartialType(CreateAlarmInputDto) {}
