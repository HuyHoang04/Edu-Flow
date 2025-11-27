import { Injectable } from '@nestjs/common';
import { NodeExecutor } from './node-executor.interface';
import { ReportsService } from '../../reports/reports.service';
import { ReportType } from '../../reports/report.entity';

@Injectable()
export class ReportNodeExecutor implements NodeExecutor {
    constructor(private reportsService: ReportsService) { }

    async execute(node: any, context: any, execution: any, workflow?: any): Promise<any> {
        console.log(`[ReportNode] Executing for node: ${node.id}`);

        const { reportType, classId, examId, studentId, startDate, endDate } = node.data;
        const generatedBy = context.userId || 'system';

        let report;

        try {
            switch (reportType) {
                case ReportType.ATTENDANCE:
                    report = await this.reportsService.generateAttendanceReport(
                        classId || context.classId,
                        startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 30)), // Default last 30 days
                        endDate ? new Date(endDate) : new Date(),
                        generatedBy
                    );
                    break;
                case ReportType.EXAM_RESULTS:
                    report = await this.reportsService.generateExamResultsReport(
                        examId || context.createdExamId || context.examId,
                        generatedBy
                    );
                    break;
                case ReportType.CLASS_PERFORMANCE:
                    report = await this.reportsService.generateClassPerformanceReport(
                        classId || context.classId,
                        generatedBy
                    );
                    break;
                case ReportType.STUDENT_PROGRESS:
                    report = await this.reportsService.generateStudentProgressReport(
                        studentId || context.studentId,
                        generatedBy
                    );
                    break;
                default:
                    throw new Error(`Unsupported report type: ${reportType}`);
            }

            console.log(`[ReportNode] Generated report: ${report.id} (${report.type})`);

            context.reportId = report.id;
            context.report = report;

            return {
                success: true,
                output: {
                    reportId: report.id,
                    report: report
                }
            };
        } catch (error: any) {
            console.error(`[ReportNode] Error generating report: ${error.message}`);
            return {
                success: false,
                error: error.message
            };
        }
    }
}
