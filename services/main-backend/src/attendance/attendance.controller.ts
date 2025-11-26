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
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Attendance } from './attendance.entity';

@Controller('attendance')
@UseGuards(JwtAuthGuard)
export class AttendanceController {
    constructor(private attendanceService: AttendanceService) { }

    @Get()
    async findAll(
        @Query('classId') classId?: string,
        @Query('date') date?: string,
    ) {
        return this.attendanceService.findAll(classId, date);
    }

    @Get('student/:studentId')
    async findByStudent(@Param('studentId') studentId: string) {
        return this.attendanceService.findByStudent(studentId);
    }

    @Get('class/:classId')
    async findByClass(
        @Param('classId') classId: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        return this.attendanceService.findByClass(classId, startDate, endDate);
    }

    @Get('stats/:classId')
    async getStats(
        @Param('classId') classId: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        return this.attendanceService.getAttendanceStats(classId, startDate, endDate);
    }

    @Post()
    async create(@Body() attendanceData: Partial<Attendance>) {
        return this.attendanceService.create(attendanceData);
    }

    @Post('bulk')
    async bulkCreate(@Body() attendanceData: Partial<Attendance>[]) {
        return this.attendanceService.bulkCreate(attendanceData);
    }

    @Put(':id')
    async update(
        @Param('id') id: string,
        @Body() attendanceData: Partial<Attendance>,
    ) {
        return this.attendanceService.update(id, attendanceData);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        await this.attendanceService.delete(id);
        return { message: 'Attendance record deleted successfully' };
    }
}
