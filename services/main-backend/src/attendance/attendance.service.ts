import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Attendance } from './attendance.entity';

@Injectable()
export class AttendanceService {
    constructor(
        @InjectRepository(Attendance)
        private attendanceRepository: Repository<Attendance>,
    ) { }

    async findAll(classId?: string, date?: string): Promise<Attendance[]> {
        const where: any = {};
        if (classId) where.classId = classId;
        if (date) where.date = new Date(date);
        return this.attendanceRepository.find({ where });
    }

    async findByStudent(studentId: string): Promise<Attendance[]> {
        return this.attendanceRepository.find({ where: { studentId } });
    }

    async findByClass(classId: string, startDate?: string, endDate?: string): Promise<Attendance[]> {
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

    async bulkCreate(attendanceData: Partial<Attendance>[]): Promise<Attendance[]> {
        const attendanceRecords = this.attendanceRepository.create(attendanceData);
        return this.attendanceRepository.save(attendanceRecords);
    }

    async update(id: string, attendanceData: Partial<Attendance>): Promise<Attendance> {
        await this.attendanceRepository.update(id, attendanceData);
        const attendance = await this.attendanceRepository.findOne({ where: { id } });
        if (!attendance) {
            throw new Error('Attendance record not found');
        }
        return attendance;
    }

    async delete(id: string): Promise<void> {
        await this.attendanceRepository.delete(id);
    }

    async getAttendanceStats(classId: string, startDate?: string, endDate?: string) {
        const records = await this.findByClass(classId, startDate, endDate);
        const total = records.length;
        const present = records.filter(r => r.status === 'present').length;
        const absent = records.filter(r => r.status === 'absent').length;
        const late = records.filter(r => r.status === 'late').length;
        const excused = records.filter(r => r.status === 'excused').length;

        return {
            total,
            present,
            absent,
            late,
            excused,
            presentRate: total > 0 ? (present / total) * 100 : 0,
        };
    }
}
