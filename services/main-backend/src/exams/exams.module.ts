import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Exam } from './exam.entity';
import { ExamAttempt } from './exam-attempt.entity';
import { ExamResult } from './exam-result.entity';
import { ExamsService } from './exams.service';
import { ExamsController } from './exams.controller';
import { GradingService } from './grading.service';
import { QuestionsModule } from '../questions/questions.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Exam, ExamAttempt, ExamResult]),
        QuestionsModule,
    ],
    controllers: [ExamsController],
    providers: [ExamsService, GradingService],
    exports: [ExamsService, GradingService],
})
export class ExamsModule { }
