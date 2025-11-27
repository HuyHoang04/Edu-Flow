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
import { ExamsService } from './exams.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Exam } from './exam.entity';

@Controller('exams')
@UseGuards(JwtAuthGuard)
export class ExamsController {
    constructor(private examsService: ExamsService) { }

    @Get()
    async findAll(@Query('classId') classId?: string) {
        return this.examsService.findAll(classId);
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.examsService.findById(id);
    }

    @Get(':id/results')
    async getExamResults(@Param('id') id: string) {
        return this.examsService.getExamResults(id);
    }

    @Get(':id/stats')
    async getExamStats(@Param('id') id: string) {
        return this.examsService.getExamStats(id);
    }

    @Post()
    async create(@Body() examData: Partial<Exam>, @Req() req: any) {
        return this.examsService.create({
            ...examData,
            createdBy: req.user.id,
        });
    }

    @Post(':id/start')
    async startExam(
        @Param('id') examId: string,
        @Req() req: any,
    ) {
        return this.examsService.startExam(examId, req.user.id);
    }

    @Get('attempts/:attemptId')
    async getAttempt(@Param('attemptId') attemptId: string) {
        return this.examsService.getAttemptById(attemptId);
    }

    @Post('attempts/:attemptId/submit')
    async submitExam(
        @Param('attemptId') attemptId: string,
        @Body('answers') answers: Array<{ questionId: string; answer: string }>,
    ) {
        return this.examsService.submitExam(attemptId, answers);
    }

    @Get('attempts/:attemptId/result')
    async getAttemptResult(@Param('attemptId') attemptId: string) {
        const attempt = await this.examsService.getAttemptById(attemptId);
        const exam = await this.examsService.findById(attempt.examId);

        if (!exam) {
            throw new Error('Exam not found');
        }

        const passed = attempt.totalScore ? attempt.totalScore >= Number(exam.passingScore) : false;

        return {
            ...attempt,
            exam,
            passed,
        };
    }

    @Post('attempts/:attemptId/grade')
    async gradeExam(@Param('attemptId') attemptId: string) {
        return this.examsService.gradeExam(attemptId);
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() examData: Partial<Exam>) {
        return this.examsService.update(id, examData);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        await this.examsService.delete(id);
        return { message: 'Exam deleted successfully' };
    }
}
