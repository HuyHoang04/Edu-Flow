import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ClassesService } from './classes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Class } from './class.entity';

@Controller('classes')
@UseGuards(JwtAuthGuard)
export class ClassesController {
  constructor(private classesService: ClassesService) { }

  @Get()
  async findAll(@Query('teacherId') teacherId: string, @Req() req: any) {
    // Prioritize authenticated user, but allow admin override if needed (omitted for now)
    return this.classesService.findAll(req.user.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.classesService.findById(id);
  }

  @Post()
  async create(@Body() classData: Partial<Class>, @Req() req: any) {
    return this.classesService.create({
      ...classData,
      teacherId: req.user.id,
    });
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() classData: Partial<Class>) {
    return this.classesService.update(id, classData);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.classesService.delete(id);
    return { message: 'Class deleted successfully' };
  }
}
