import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Exam } from './exam.entity';
import { ExamAttempt } from './exam-attempt.entity';
import { ExamResult } from './exam-result.entity';
import { QuestionsService } from '../questions/questions.service';
import { GradingService } from './grading.service';

@Injectable()
export class ExamsService {
    constructor(
        @InjectRepository(Exam)
        private examsRepository: Repository<Exam>,
        @InjectRepository(ExamAttempt)
        private attemptsRepository: Repository<ExamAttempt>,
        @InjectRepository(ExamResult)
        private resultsRepository: Repository<ExamResult>,
        private questionsService: QuestionsService,
        private gradingService: GradingService,
    ) { }

    // Exam CRUD
    async findAll(classId?: string): Promise<Exam[]> {
        if (classId) {
            return this.examsRepository.find({ where: { classId } });
        }
        return this.examsRepository.find();
    }

    async findById(id: string): Promise<Exam | null> {
        return this.examsRepository.findOne({ where: { id } });
    }

    async create(examData: Partial<Exam>): Promise<Exam> {
        const exam = this.examsRepository.create(examData);
        return this.examsRepository.save(exam);
    }

    async update(id: string, examData: Partial<Exam>): Promise<Exam> {
        await this.examsRepository.update(id, examData);
        const exam = await this.findById(id);
        if (!exam) {
            throw new Error('Exam not found');
        }
        return exam;
    }

    async delete(id: string): Promise<void> {
        await this.examsRepository.delete(id);
    }

    // Exam Attempts
    async startExam(examId: string, studentId: string): Promise<ExamAttempt> {
        const attempt = this.attemptsRepository.create({
            examId,
            studentId,
            startedAt: new Date(),
            answers: [],
            isGraded: false,
        });
        return this.attemptsRepository.save(attempt);
    }

    async submitExam(
        attemptId: string,
        answers: Array<{ questionId: string; answer: string }>,
    ): Promise<ExamAttempt> {
        const attempt = await this.attemptsRepository.findOne({
            where: { id: attemptId },
        });
        if (!attempt) {
            throw new Error('Exam attempt not found');
        }

        attempt.answers = answers;
        attempt.submittedAt = new Date();
        await this.attemptsRepository.save(attempt);

        // Auto-grade the exam
        await this.gradeExam(attemptId);

        const gradedAttempt = await this.attemptsRepository.findOne({
            where: { id: attemptId },
        });
        if (!gradedAttempt) {
            throw new Error('Exam attempt not found after grading');
        }
        return gradedAttempt;
    }

    async gradeExam(attemptId: string): Promise<ExamResult> {
        const attempt = await this.attemptsRepository.findOne({
            where: { id: attemptId },
        });
        if (!attempt) {
            throw new Error('Exam attempt not found');
        }

        const exam = await this.findById(attempt.examId);
        if (!exam) {
            throw new Error('Exam not found');
        }

        // Get all questions
        const questionIds = exam.questions.map((q) => q.questionId);
        const questions = await this.questionsService.findByIds(questionIds);

        // Auto-grade
        const gradingResult = await this.gradingService.autoGrade(
            attempt,
            questions,
        );

        // Update attempt with scores
        attempt.autoGradeScore = gradingResult.autoGradeScore;
        attempt.totalScore = gradingResult.autoGradeScore;
        attempt.isGraded = !gradingResult.needsManualGrading;
        await this.attemptsRepository.save(attempt);

        // Create result
        const percentage =
            (gradingResult.autoGradeScore / Number(exam.totalPoints)) * 100;
        const result = this.resultsRepository.create({
            attemptId: attempt.id,
            studentId: attempt.studentId,
            examId: exam.id,
            score: gradingResult.autoGradeScore,
            percentage,
            passed: gradingResult.autoGradeScore >= Number(exam.passingScore),
        });

        return this.resultsRepository.save(result);
    }

    async getExamResults(examId: string): Promise<ExamResult[]> {
        return this.resultsRepository.find({ where: { examId } });
    }

    async getStudentResults(studentId: string): Promise<ExamResult[]> {
        return this.resultsRepository.find({ where: { studentId } });
    }

    async getExamStats(examId: string) {
        const results = await this.getExamResults(examId);
        const total = results.length;
        const passed = results.filter((r) => r.passed).length;
        const avgScore =
            total > 0
                ? results.reduce((sum, r) => sum + Number(r.score), 0) / total
                : 0;

        return {
            total,
            passed,
            failed: total - passed,
            passRate: total > 0 ? (passed / total) * 100 : 0,
            averageScore: avgScore,
            averagePercentage:
                total > 0
                    ? results.reduce((sum, r) => sum + Number(r.percentage), 0) / total
                    : 0,
        };
    }
}
