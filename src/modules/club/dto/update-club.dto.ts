import { PartialType } from '@nestjs/mapped-types';
import { CreateClubInputDto } from './create-club.dto';

export class UpdateClubDto extends PartialType(CreateClubInputDto) {}
