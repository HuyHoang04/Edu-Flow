import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Exam } from './exam.entity';
import { ExamAttempt } from './exam-attempt.entity';
import { ExamResult } from './exam-result.entity';
import { QuestionsService } from '../questions/questions.service';
import { AuthService } from '../auth/auth.service';
import { StudentsService } from '../students/students.service';
import { GradingService } from './grading.service';
import { WorkflowsService } from '../workflows/workflows.service';

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
    private authService: AuthService,
    private studentsService: StudentsService,
    @Inject(forwardRef(() => WorkflowsService))
    private workflowsService: WorkflowsService,
  ) { }

  // Exam CRUD
  async findAll(classId?: string, teacherId?: string): Promise<Exam[]> {
    const where: any = {};
    if (classId) where.classId = classId;
    if (teacherId) where.createdBy = teacherId;

    return this.examsRepository.find({ where });
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
    // Check for existing unfinished attempt
    const existingAttempt = await this.attemptsRepository.findOne({
      where: {
        examId,
        studentId,
        isGraded: false,
      },
    });

    if (existingAttempt) {
      return existingAttempt;
    }

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

  async getAttemptById(attemptId: string): Promise<ExamAttempt> {
    const attempt = await this.attemptsRepository.findOne({
      where: { id: attemptId },
    });
    if (!attempt) {
      throw new Error('Exam attempt not found');
    }
    return attempt;
  }

  async gradeExam(attemptId: string): Promise<ExamResult> {
    console.log('[ExamsService] gradeExam called for attempt:', attemptId);

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

    const student = await this.studentsService.findById(attempt.studentId);
    if (!student) {
      throw new Error('Student not found');
    }

    // Get all questions
    const questionIds = exam.questions.map((q) => q.questionId);
    let questions = await this.questionsService.findByIds(questionIds);

    // Apply point overrides from Exam definition
    questions = questions.map(q => {
      const examQuestion = exam.questions.find(eq => eq.questionId === q.id);
      if (examQuestion?.points !== undefined) {
        return { ...q, points: Number(examQuestion.points) } as any;
      }
      return q;
    });

    // Auto-grade (Objective only)
    const gradingResult = await this.gradingService.autoGrade(
      attempt,
      questions,
    );

    // Update attempt with scores
    attempt.autoGradeScore = gradingResult.autoGradeScore;
    attempt.totalScore = gradingResult.autoGradeScore;
    attempt.isGraded = !gradingResult.needsManualGrading;
    await this.attemptsRepository.save(attempt);

    // Create or Update result
    let result = await this.resultsRepository.findOne({ where: { attemptId: attempt.id } });
    const percentage = (gradingResult.autoGradeScore / Number(exam.totalPoints)) * 100;

    if (result) {
      result.score = gradingResult.autoGradeScore;
      result.percentage = percentage;
      result.passed = gradingResult.autoGradeScore >= Number(exam.passingScore);
    } else {
      result = this.resultsRepository.create({
        attemptId: attempt.id,
        studentId: attempt.studentId,
        examId: exam.id,
        score: gradingResult.autoGradeScore,
        percentage,
        passed: gradingResult.autoGradeScore >= Number(exam.passingScore),
      });
    }

    const savedResult = await this.resultsRepository.save(result);
    console.log('[ExamsService] Result saved:', savedResult.id);

    // Workflow trigger removed as per user request for standard grading
    console.log('[ExamsService] Standard grading completed, workflow skipped.');

    return savedResult;
  }

  async getExamResults(examId: string): Promise<any[]> {
    const results = await this.resultsRepository.find({
      where: { examId },
      relations: ['student'],
    });

    // Map results to match frontend expectations (Frontend expects ExamAttempt fields mixed in)
    return results.map(r => ({
      ...r,
      totalScore: r.score, // Frontend uses totalScore
      isGraded: true,      // If result exists, it's considered graded
      submittedAt: r.createdAt // Approximation if join not available
    }));
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

  async updateResult(
    resultId: string,
    updateData: Partial<ExamResult>,
  ): Promise<ExamResult> {
    await this.resultsRepository.update(resultId, updateData);
    const result = await this.resultsRepository.findOne({
      where: { id: resultId },
    });
    if (!result) {
      throw new Error('Exam result not found');
    }
    return result;
  }

  async getExamForTaking(examId: string, userId: string): Promise<any> {
    const exam = await this.findById(examId);
    if (!exam) {
      throw new Error('Exam not found');
    }

    // TODO: Check if user is enrolled in the class
    // TODO: Check if exam is active (time window)

    // Get questions with content
    const questionIds = exam.questions.map((q) => q.questionId);
    const questions = await this.questionsService.findByIds(questionIds);

    // Sanitize questions (remove correct answers)
    const sanitizedQuestions = questions.map((q) => {
      const { correctAnswer, explanation, ...rest } = q;
      return rest;
    });

    // Sort questions based on exam order
    const orderedQuestions = exam.questions
      .map((eq) => {
        const question = sanitizedQuestions.find((q) => q.id === eq.questionId);
        if (question) {
          return {
            ...question,
            points: eq.points || question.points, // Override points if specified in exam
          };
        }
        return null;
      })
      .filter(Boolean);

    return {
      ...exam,
      questions: orderedQuestions,
    };
  }

  async enterExam(examId: string, studentCode: string) {
    const exam = await this.findById(examId);
    if (!exam) {
      throw new Error('Exam not found');
    }

    const student = await this.studentsService.findByCode(studentCode);
    if (!student) {
      throw new Error('Student not found');
    }

    if (exam.classId && student.classId !== exam.classId) {
      throw new Error('Student is not enrolled in the class for this exam');
    }

    return this.authService.loginStudent(student);
  }
}
