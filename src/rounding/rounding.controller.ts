import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RoundingService } from './rounding.service';
import { CreateRoundingDto } from './dto/create-rounding.dto';
import { UpdateRoundingDto } from './dto/update-rounding.dto';

@Controller('rounding')
export class RoundingController {
  constructor(private readonly roundingService: RoundingService) {}

  @Post()
  create(@Body() createRoundingDto: CreateRoundingDto) {
    return this.roundingService.create(createRoundingDto);
  }

  @Get()
  findAll() {
    return this.roundingService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roundingService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRoundingDto: UpdateRoundingDto) {
    return this.roundingService.update(+id, updateRoundingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.roundingService.remove(+id);
  }
}
