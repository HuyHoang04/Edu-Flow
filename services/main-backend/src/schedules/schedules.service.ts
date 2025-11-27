import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Schedule } from './schedule.entity';

@Injectable()
export class SchedulesService {
  constructor(
    @InjectRepository(Schedule)
    private schedulesRepository: Repository<Schedule>,
  ) {}

  async findAll(classId?: string): Promise<Schedule[]> {
    if (classId) {
      return this.schedulesRepository.find({
        where: { classId },
        order: { dayOfWeek: 'ASC', startTime: 'ASC' },
        relations: ['class'],
      });
    }
    return this.schedulesRepository.find({
      order: { dayOfWeek: 'ASC' },
      relations: ['class'],
    });
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
