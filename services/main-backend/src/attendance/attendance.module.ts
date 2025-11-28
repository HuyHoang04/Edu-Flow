import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attendance } from './attendance.entity';
import { AttendanceService } from './attendance.service';
import { AttendanceSession } from './attendance-session.entity';
import { AttendanceController } from './attendance.controller';

import { Student } from '../students/student.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Attendance, AttendanceSession, Student])],
  controllers: [AttendanceController],
  providers: [AttendanceService],
  exports: [AttendanceService],
})
export class AttendanceModule { }
