import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Report } from './report.entity';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { AttendanceModule } from '../attendance/attendance.module';
import { ExamsModule } from '../exams/exams.module';
import { StudentsModule } from '../students/students.module';
import { ClassesModule } from '../classes/classes.module';
import { EmailsModule } from '../emails/emails.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Report]),
    AttendanceModule,
    forwardRef(() => ExamsModule),
    StudentsModule,
    StudentsModule,
    ClassesModule,
    EmailsModule,
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule { }
