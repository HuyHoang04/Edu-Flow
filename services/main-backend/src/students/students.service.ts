import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './student.entity';
import * as xlsx from 'xlsx';
import { Express } from 'express';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    public studentsRepository: Repository<Student>,
  ) { }

  async findAll(classId?: string, teacherId?: string): Promise<Student[]> {
    const query = this.studentsRepository
      .createQueryBuilder('student')
      .leftJoinAndSelect('student.class', 'class');

    if (classId) {
      query.where('student.classId = :classId', { classId });
    }

    if (teacherId) {
      query.andWhere('class.teacherId = :teacherId', { teacherId });
    }

    return query.getMany();
  }

  async findById(id: string): Promise<Student | null> {
    return this.studentsRepository.findOne({ where: { id } });
  }

  async findByCode(code: string): Promise<Student | null> {
    return this.studentsRepository.findOne({ where: { code } });
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

  async importFromExcel(file: any): Promise<any> {
    const workbook = xlsx.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    const studentsToCreate: Partial<Student>[] = [];
    const errors: any[] = [];

    for (const row of data as any[]) {
      // Basic validation
      if (!row.email || !row.name) {
        errors.push({ row, error: 'Missing required fields (email, name)' });
        continue;
      }

      // Check if student exists
      const existingStudent = await this.studentsRepository.findOne({
        where: [{ email: row.email }, { code: row.code }],
      });

      if (existingStudent) {
        errors.push({
          row,
          error: `Student with email ${row.email} or code ${row.code} already exists`,
        });
        continue;
      }

      studentsToCreate.push({
        name: row.name,
        email: row.email,
        code: row.code,
        phone: row.phone,
        classId: row.classId,
      });
    }

    if (studentsToCreate.length > 0) {
      await this.studentsRepository.save(studentsToCreate);
    }

    return {
      importedCount: studentsToCreate.length,
      errors,
    };
  }

  async bulkCreate(studentsData: Partial<Student>[]): Promise<Student[]> {
    const students = this.studentsRepository.create(studentsData);
    return this.studentsRepository.save(students);
  }
}
