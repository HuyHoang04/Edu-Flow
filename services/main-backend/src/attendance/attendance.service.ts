import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { AttendanceSession } from './attendance-session.entity';
import { Attendance } from './attendance.entity';
import { Student } from '../students/student.entity';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
    @InjectRepository(AttendanceSession)
    private attendanceSessionRepository: Repository<AttendanceSession>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
  ) { }

  async createSession(data: {
    classId: string;
    scheduleId?: string;
    timeoutMinutes: number;
  }): Promise<AttendanceSession> {
    const code = Math.floor(1000 + Math.random() * 9000).toString(); // 4 digit code
    const now = new Date();
    const expiryTime = new Date(now.getTime() + data.timeoutMinutes * 60000);

    const session = this.attendanceSessionRepository.create({
      classId: data.classId,
      scheduleId: data.scheduleId,
      code,
      expiryTime,
      isActive: true,
    });

    return this.attendanceSessionRepository.save(session);
  }

  async getSessionByCode(code: string): Promise<AttendanceSession | null> {
    return this.attendanceSessionRepository.findOne({
      where: { code, isActive: true },
    });
  }

  async getSessionsByClass(classId: string): Promise<AttendanceSession[]> {
    return this.attendanceSessionRepository.find({
      where: { classId },
      order: { createdAt: 'DESC' },
    });
  }

  async checkInWithCode(code: string, studentCode: string): Promise<Attendance> {
    const session = await this.getSessionByCode(code);
    if (!session) {
      throw new Error('Mã điểm danh không hợp lệ hoặc đã hết hạn');
    }

    if (new Date() > session.expiryTime) {
      throw new Error('Mã điểm danh đã hết hạn');
    }

    // Lookup student by MSSV (code)
    const student = await this.studentRepository.findOne({ where: { code: studentCode } });
    if (!student) {
      throw new Error(`Không tìm thấy sinh viên với mã số ${studentCode}`);
    }

    // Check if already checked in today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await this.attendanceRepository.findOne({
      where: {
        studentId: student.id,
        classId: session.classId,
        date: today,
      },
    });

    if (existing) {
      if (existing.status === 'present') {
        return existing;
      }
      // Update status if previously absent/late
      existing.status = 'present';
      existing.note = 'Checked in via code';
      return this.attendanceRepository.save(existing);
    }

    // Create new record
    const attendance = this.attendanceRepository.create({
      studentId: student.id,
      classId: session.classId,
      scheduleId: session.scheduleId,
      date: today,
      status: 'present',
      note: 'Checked in via code',
    });

    return this.attendanceRepository.save(attendance);
  }

  async findAll(classId?: string, date?: string): Promise<Attendance[]> {
    const where: any = {};
    if (classId) where.classId = classId;
    if (date) where.date = new Date(date);
    return this.attendanceRepository.find({ where });
  }

  async findByStudent(studentId: string): Promise<Attendance[]> {
    return this.attendanceRepository.find({ where: { studentId } });
  }

  async findByClass(
    classId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<Attendance[]> {
    const where: any = { classId };
    if (startDate && endDate) {
      where.date = Between(new Date(startDate), new Date(endDate));
    }
    return this.attendanceRepository.find({ where, order: { date: 'DESC' } });
  }

  async create(attendanceData: Partial<Attendance>): Promise<Attendance> {
    const attendance = this.attendanceRepository.create(attendanceData);
    return this.attendanceRepository.save(attendance);
  }

  async bulkCreate(
    attendanceData: Partial<Attendance>[],
  ): Promise<Attendance[]> {
    const attendanceRecords = this.attendanceRepository.create(attendanceData);
    return this.attendanceRepository.save(attendanceRecords);
  }

  async update(
    id: string,
    attendanceData: Partial<Attendance>,
  ): Promise<Attendance> {
    await this.attendanceRepository.update(id, attendanceData);
    const attendance = await this.attendanceRepository.findOne({
      where: { id },
    });
    if (!attendance) {
      throw new Error('Attendance record not found');
    }
    return attendance;
  }

  async delete(id: string): Promise<void> {
    await this.attendanceRepository.delete(id);
  }

  async getAttendanceStats(
    classId: string,
    startDate?: string,
    endDate?: string,
  ) {
    const records = await this.findByClass(classId, startDate, endDate);
    const total = records.length;
    const present = records.filter((r) => r.status === 'present').length;
    const absent = records.filter((r) => r.status === 'absent').length;
    const late = records.filter((r) => r.status === 'late').length;
    const excused = records.filter((r) => r.status === 'excused').length;

    return {
      total,
      present,
      absent,
      late,
      excused,
      presentRate: total > 0 ? (present / total) * 100 : 0,
    };
  }
  async getWeeklyStats() {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const records = await this.attendanceRepository.find({
      where: {
        date: Between(sevenDaysAgo, today),
      },
    });

    const stats: { name: string; present: number; absent: number }[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(sevenDaysAgo);
      date.setDate(sevenDaysAgo.getDate() + i);
      const dateString = date.toLocaleDateString('vi-VN', { weekday: 'short' }); // T2, T3...

      // Compare dates ignoring time
      const dayRecords = records.filter(r => {
        const rDate = new Date(r.date);
        return rDate.getDate() === date.getDate() &&
          rDate.getMonth() === date.getMonth() &&
          rDate.getFullYear() === date.getFullYear();
      });

      stats.push({
        name: dateString,
        present: dayRecords.filter(r => r.status === 'present').length,
        absent: dayRecords.filter(r => r.status === 'absent').length,
      });
    }

    return stats;
  }
}
