import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
} from 'typeorm';

@Entity('exam_results')
export class ExamResult {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    attemptId: string;

    @Column()
    studentId: string;

    @Column()
    examId: string;

    @Column({ type: 'decimal', precision: 5, scale: 2 })
    score: number;

    @Column({ type: 'decimal', precision: 5, scale: 2 })
    percentage: number;

    @Column({ default: false })
    passed: boolean;

    @Column({ type: 'text', nullable: true })
    feedback: string;

    @CreateDateColumn()
    createdAt: Date;
}
