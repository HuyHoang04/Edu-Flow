import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Class } from './class.entity';

@Injectable()
export class ClassesService {
  constructor(
    @InjectRepository(Class)
    public classesRepository: Repository<Class>,
  ) {}

  async findAll(teacherId?: string): Promise<Class[]> {
    const query = this.classesRepository
      .createQueryBuilder('class')
      .loadRelationCountAndMap('class.studentCount', 'class.students');

    if (teacherId) {
      query.where('class.teacherId = :teacherId', { teacherId });
    }

    return query.getMany();
  }

  async findById(id: string): Promise<Class | null> {
    return this.classesRepository.findOne({
      where: { id },
      relations: ['students'],
    });
  }

  async create(classData: Partial<Class>): Promise<Class> {
    const classEntity = this.classesRepository.create(classData);
    return this.classesRepository.save(classEntity);
  }

  async update(id: string, classData: Partial<Class>): Promise<Class> {
    await this.classesRepository.update(id, classData);
    const classEntity = await this.findById(id);
    if (!classEntity) {
      throw new Error('Class not found');
    }
    return classEntity;
  }

  async delete(id: string): Promise<void> {
    await this.classesRepository.delete(id);
  }
}
