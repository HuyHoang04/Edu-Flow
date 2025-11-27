import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum ReportType {
  ATTENDANCE = 'attendance',
  EXAM_RESULTS = 'exam_results',
  CLASS_PERFORMANCE = 'class_performance',
  STUDENT_PROGRESS = 'student_progress',
}

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({
    type: 'enum',
    enum: ReportType,
  })
  type: ReportType;

  @Column({ type: 'jsonb' })
  data: any; // Report data

  @Column({ type: 'jsonb', nullable: true })
  filters: any; // Filters used to generate report

  @Column()
  generatedBy: string; // User ID

  @CreateDateColumn()
  createdAt: Date;
}
