import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './student.entity';

@Injectable()
export class StudentsService {
    constructor(
        @InjectRepository(Student)
        private studentsRepository: Repository<Student>,
    ) { }

    async findAll(classId?: string): Promise<Student[]> {
        if (classId) {
            return this.studentsRepository.find({ where: { classId } });
        }
        return this.studentsRepository.find();
    }

    async findById(id: string): Promise<Student | null> {
        return this.studentsRepository.findOne({ where: { id } });
    }

    async create(studentData: Partial<Student>): Promise<Student> {
        const student = this.studentsRepository.create(studentData);
        return this.studentsRepository.save(student);
    }

    async update(id: string, studentData: Partial<Student>): Promise<Student> {
        await this.studentsRepository.update(id, studentData);
        const student = await this.findById(id);
        if (!student) {
            throw new Error('Student not found');
        }
        return student;
    }

    async delete(id: string): Promise<void> {
        await this.studentsRepository.delete(id);
    }

    async bulkCreate(studentsData: Partial<Student>[]): Promise<Student[]> {
        const students = this.studentsRepository.create(studentsData);
        return this.studentsRepository.save(students);
    }
}
