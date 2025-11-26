import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Class } from './class.entity';

@Injectable()
export class ClassesService {
    constructor(
        @InjectRepository(Class)
        private classesRepository: Repository<Class>,
    ) { }

    async findAll(teacherId?: string): Promise<Class[]> {
        if (teacherId) {
            return this.classesRepository.find({ where: { teacherId } });
        }
        return this.classesRepository.find();
    }

    async findById(id: string): Promise<Class | null> {
        return this.classesRepository.findOne({ where: { id } });
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
