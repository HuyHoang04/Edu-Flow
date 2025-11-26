import {
    Controller,
    Get,
    Post,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
    constructor(private reportsService: ReportsService) { }

    @Get()
    async findAll(@Query('generatedBy') generatedBy?: string) {
        return this.reportsService.findAll(generatedBy);
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.reportsService.findById(id);
    }

    @Post('attendance')
    async generateAttendanceReport(
        @Body()
        data: {
            classId: string;
            startDate: string;
            endDate: string;
            generatedBy: string;
        },
    ) {
        return this.reportsService.generateAttendanceReport(
            data.classId,
            new Date(data.startDate),
            new Date(data.endDate),
            data.generatedBy,
        );
    }

    @Post('exam-results')
    async generateExamResultsReport(
        @Body() data: { examId: string; generatedBy: string },
    ) {
        return this.reportsService.generateExamResultsReport(
            data.examId,
            data.generatedBy,
        );
    }

    @Post('class-performance')
    async generateClassPerformanceReport(
        @Body() data: { classId: string; generatedBy: string },
    ) {
        return this.reportsService.generateClassPerformanceReport(
            data.classId,
            data.generatedBy,
        );
    }

    @Post('student-progress')
    async generateStudentProgressReport(
        @Body() data: { studentId: string; generatedBy: string },
    ) {
        return this.reportsService.generateStudentProgressReport(
            data.studentId,
            data.generatedBy,
        );
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        await this.reportsService.delete(id);
        return { message: 'Report deleted successfully' };
    }
}
