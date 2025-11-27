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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StudentsService } from './students.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Student } from './student.entity';

@Controller('students')
@UseGuards(JwtAuthGuard)
export class StudentsController {
  constructor(private studentsService: StudentsService) {}

  @Get()
  async findAll(@Query('classId') classId?: string) {
    return this.studentsService.findAll(classId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.studentsService.findById(id);
  }

  @Post()
  async create(@Body() studentData: Partial<Student>) {
    return this.studentsService.create(studentData);
  }

  @Post('bulk')
  async bulkCreate(@Body() studentsData: Partial<Student>[]) {
    return this.studentsService.bulkCreate(studentsData);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() studentData: Partial<Student>) {
    return this.studentsService.update(id, studentData);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.studentsService.delete(id);
    return { message: 'Student deleted successfully' };
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  async import(@UploadedFile() file: any) {
    if (!file) {
      throw new Error('No file uploaded');
    }
    return this.studentsService.importFromExcel(file);
  }
}
