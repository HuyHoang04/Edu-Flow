import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Class } from '../classes/class.entity';
import { Student } from '../students/student.entity';

@Entity('attendance')
export class Attendance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  studentId: string;

  @Column({ nullable: true })
  classId: string;

  @Column({ nullable: true })
  scheduleId: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({ default: 'present' })
  status: string; // present, absent, late, excused

  @Column({ type: 'text', nullable: true })
  note: string;

  @ManyToOne(() => Class)
  @JoinColumn({ name: 'classId' })
  class: Class;

  @ManyToOne(() => Student)
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
