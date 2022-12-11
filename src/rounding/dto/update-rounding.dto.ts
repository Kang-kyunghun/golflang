import { PartialType } from '@nestjs/swagger';
import { CreateRoundingDto } from './create-rounding.dto';

export class UpdateRoundingDto extends PartialType(CreateRoundingDto) {}
