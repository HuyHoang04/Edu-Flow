import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Schedule } from './schedule.entity';

@Injectable()
export class SchedulesService {
  constructor(
    @InjectRepository(Schedule)
    private schedulesRepository: Repository<Schedule>,
  ) { }

  async findAll(classId?: string, teacherId?: string): Promise<Schedule[]> {
    const query = this.schedulesRepository
      .createQueryBuilder('schedule')
      .leftJoinAndSelect('schedule.class', 'class')
      .orderBy('schedule.dayOfWeek', 'ASC')
      .addOrderBy('schedule.startTime', 'ASC');

    if (classId) {
      query.where('schedule.classId = :classId', { classId });
    }

    if (teacherId) {
      query.andWhere('class.teacherId = :teacherId', { teacherId });
    }

    return query.getMany();
  }

  async findByClass(classId: string): Promise<Schedule[]> {
    return this.schedulesRepository.find({
      where: { classId },
      order: { dayOfWeek: 'ASC', startTime: 'ASC' },
    });
  }

  async findByDay(classId: string, dayOfWeek: number): Promise<Schedule[]> {
    return this.schedulesRepository.find({
      where: { classId, dayOfWeek },
      order: { startTime: 'ASC' },
    });
  }

  async create(scheduleData: Partial<Schedule>): Promise<Schedule> {
    const schedule = this.schedulesRepository.create(scheduleData);
    return this.schedulesRepository.save(schedule);
  }

  async update(id: string, scheduleData: Partial<Schedule>): Promise<Schedule> {
    await this.schedulesRepository.update(id, scheduleData);
    const schedule = await this.schedulesRepository.findOne({ where: { id } });
    if (!schedule) {
      throw new Error('Schedule not found');
    }
    return schedule;
  }

  async delete(id: string): Promise<void> {
    await this.schedulesRepository.delete(id);
  }
}
