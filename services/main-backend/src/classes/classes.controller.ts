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
} from '@nestjs/common';
import { ClassesService } from './classes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Class } from './class.entity';

@Controller('classes')
@UseGuards(JwtAuthGuard)
export class ClassesController {
    constructor(private classesService: ClassesService) { }

    @Get()
    async findAll(@Query('teacherId') teacherId?: string) {
        return this.classesService.findAll(teacherId);
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.classesService.findById(id);
    }

    @Post()
    async create(@Body() classData: Partial<Class>) {
        return this.classesService.create(classData);
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
