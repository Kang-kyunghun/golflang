import { Injectable } from '@nestjs/common';
import { CreateRoundingDto } from './dto/create-rounding.dto';
import { UpdateRoundingDto } from './dto/update-rounding.dto';

@Injectable()
export class RoundingService {
  create(createRoundingDto: CreateRoundingDto) {
    return 'This action adds a new rounding';
  }

  findAll() {
    return `This action returns all rounding`;
  }

  findOne(id: number) {
    return `This action returns a #${id} rounding`;
  }

  update(id: number, updateRoundingDto: UpdateRoundingDto) {
    return `This action updates a #${id} rounding`;
  }

  remove(id: number) {
    return `This action removes a #${id} rounding`;
  }
}
