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
import { SchedulesService } from './schedules.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Schedule } from './schedule.entity';

@Controller('schedules')
@UseGuards(JwtAuthGuard)
export class SchedulesController {
    constructor(private schedulesService: SchedulesService) { }

    @Get()
    async findAll(@Query('classId') classId?: string) {
        return this.schedulesService.findAll(classId);
    }

    @Get('class/:classId')
    async findByClass(@Param('classId') classId: string) {
        return this.schedulesService.findByClass(classId);
    }

    @Get('class/:classId/day/:dayOfWeek')
    async findByDay(
        @Param('classId') classId: string,
        @Param('dayOfWeek') dayOfWeek: number,
    ) {
        return this.schedulesService.findByDay(classId, dayOfWeek);
    }

    @Post()
    async create(@Body() scheduleData: Partial<Schedule>) {
        return this.schedulesService.create(scheduleData);
    }

    @Put(':id')
    async update(
        @Param('id') id: string,
        @Body() scheduleData: Partial<Schedule>,
    ) {
        return this.schedulesService.update(id, scheduleData);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        await this.schedulesService.delete(id);
        return { message: 'Schedule deleted successfully' };
    }
}
