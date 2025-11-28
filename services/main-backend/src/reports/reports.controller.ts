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

import { EmailsService } from '../emails/emails.service';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(
    private reportsService: ReportsService,
    private emailsService: EmailsService,
  ) { }

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

  @Post('attendance/email')
  async generateAndEmailAttendanceReport(
    @Body()
    data: {
      classId: string;
      startDate: string;
      endDate: string;
      generatedBy: string;
      email: string;
    },
  ) {
    // 1. Generate Report
    const report = await this.reportsService.generateAttendanceReport(
      data.classId,
      new Date(data.startDate),
      new Date(data.endDate),
      data.generatedBy,
    );

    // 2. Format Email Body
    const reportData = report.data as any;
    const subject = `Báo cáo điểm danh - ${reportData.class.name}`;
    const body = `
      <h1>Báo cáo điểm danh</h1>
      <p><strong>Lớp:</strong> ${reportData.class.name}</p>
      <p><strong>Thời gian:</strong> ${new Date(data.startDate).toLocaleDateString()} - ${new Date(data.endDate).toLocaleDateString()}</p>
      <p><strong>Tổng số sinh viên:</strong> ${reportData.summary.totalStudents}</p>
      <p><strong>Tỷ lệ chuyên cần trung bình:</strong> ${reportData.summary.averageAttendanceRate.toFixed(2)}%</p>
      
      <h2>Chi tiết sinh viên</h2>
      <table border="1" cellpadding="5" cellspacing="0">
        <thead>
          <tr>
            <th>MSSV</th>
            <th>Tên</th>
            <th>Có mặt</th>
            <th>Vắng</th>
            <th>Tỷ lệ</th>
          </tr>
        </thead>
        <tbody>
          ${reportData.students.map((s: any) => `
            <tr>
              <td>${s.studentId}</td>
              <td>${s.name}</td>
              <td>${s.present}</td>
              <td>${s.absent}</td>
              <td>${s.presentRate.toFixed(1)}%</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    // 3. Send Email
    await this.emailsService.sendEmail({
      recipients: [data.email],
      subject,
      body,
      sentBy: data.generatedBy,
    });

    return { message: 'Report generated and emailed successfully', reportId: report.id };
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
