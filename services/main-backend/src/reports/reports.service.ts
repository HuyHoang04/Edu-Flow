import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report, ReportType } from './report.entity';
import { AttendanceService } from '../attendance/attendance.service';
import { ExamsService } from '../exams/exams.service';
import { StudentsService } from '../students/students.service';
import { ClassesService } from '../classes/classes.service';

@Injectable()
export class ReportsService {
    constructor(
        @InjectRepository(Report)
        private reportsRepository: Repository<Report>,
        private attendanceService: AttendanceService,
        private examsService: ExamsService,
        private studentsService: StudentsService,
        private classesService: ClassesService,
    ) { }

    async findAll(generatedBy?: string): Promise<Report[]> {
        if (generatedBy) {
            return this.reportsRepository.find({
                where: { generatedBy },
                order: { createdAt: 'DESC' },
            });
        }
        return this.reportsRepository.find({ order: { createdAt: 'DESC' } });
    }

    async findById(id: string): Promise<Report | null> {
        return this.reportsRepository.findOne({ where: { id } });
    }

    async generateAttendanceReport(
        classId: string,
        startDate: Date,
        endDate: Date,
        generatedBy: string,
    ): Promise<Report> {
        const classInfo = await this.classesService.findById(classId);
        const students = await this.studentsService.findAll(classId);

        const reportData: any = {
            class: classInfo,
            period: { startDate, endDate },
            students: [],
            summary: {
                totalStudents: students.length,
                averageAttendanceRate: 0,
            },
        };

        let totalAttendanceRate = 0;

        for (const student of students) {
            const stats = await this.attendanceService.getAttendanceStats(
                student.id,
                startDate.toISOString(),
                endDate.toISOString(),
            );

            reportData.students.push({
                studentId: student.id,
                name: student.name,
                email: student.email,
                ...stats,
            });

            totalAttendanceRate += stats.presentRate;
        }

        reportData.summary.averageAttendanceRate =
            students.length > 0 ? totalAttendanceRate / students.length : 0;

        const report = this.reportsRepository.create({
            title: `Attendance Report - ${classInfo?.name || classId}`,
            type: ReportType.ATTENDANCE,
            data: reportData,
            filters: { classId, startDate, endDate },
            generatedBy,
        });

        return this.reportsRepository.save(report);
    }

    async generateExamResultsReport(
        examId: string,
        generatedBy: string,
    ): Promise<Report> {
        const exam = await this.examsService.findById(examId);
        if (!exam) {
            throw new Error('Exam not found');
        }

        const results = await this.examsService.getExamResults(examId);
        const stats = await this.examsService.getExamStats(examId);

        const reportData = {
            exam,
            results: results.map((r) => ({
                studentId: r.studentId,
                score: r.score,
                percentage: r.percentage,
                passed: r.passed,
            })),
            statistics: stats,
        };

        const report = this.reportsRepository.create({
            title: `Exam Results - ${exam.title}`,
            type: ReportType.EXAM_RESULTS,
            data: reportData,
            filters: { examId },
            generatedBy,
        });

        return this.reportsRepository.save(report);
    }

    async generateClassPerformanceReport(
        classId: string,
        generatedBy: string,
    ): Promise<Report> {
        const classInfo = await this.classesService.findById(classId);
        const students = await this.studentsService.findAll(classId);

        const performanceData = {
            class: classInfo,
            totalStudents: students.length,
            students: students.map((s) => ({
                studentId: s.id,
                name: s.name,
                email: s.email,
            })),
            summary: {
                averageScore: 0,
                passRate: 0,
            },
        };

        const report = this.reportsRepository.create({
            title: `Class Performance - ${classInfo?.name || classId}`,
            type: ReportType.CLASS_PERFORMANCE,
            data: performanceData,
            filters: { classId },
            generatedBy,
        });

        return this.reportsRepository.save(report);
    }

    async generateStudentProgressReport(
        studentId: string,
        generatedBy: string,
    ): Promise<Report> {
        const student = await this.studentsService.findById(studentId);
        if (!student) {
            throw new Error('Student not found');
        }

        const examResults = await this.examsService.getStudentResults(studentId);

        const reportData = {
            student,
            exams: examResults.map((r) => ({
                examId: r.examId,
                score: r.score,
                percentage: r.percentage,
                passed: r.passed,
                createdAt: r.createdAt,
            })),
            summary: {
                totalExams: examResults.length,
                averageScore:
                    examResults.length > 0
                        ? examResults.reduce((sum, r) => sum + Number(r.score), 0) /
                        examResults.length
                        : 0,
                passRate:
                    examResults.length > 0
                        ? (examResults.filter((r) => r.passed).length /
                            examResults.length) *
                        100
                        : 0,
            },
        };

        const report = this.reportsRepository.create({
            title: `Student Progress - ${student.name}`,
            type: ReportType.STUDENT_PROGRESS,
            data: reportData,
            filters: { studentId },
            generatedBy,
        });

        return this.reportsRepository.save(report);
    }

    async delete(id: string): Promise<void> {
        await this.reportsRepository.delete(id);
    }
}
