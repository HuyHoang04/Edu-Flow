import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
} from 'typeorm';

@Entity('exam_attempts')
export class ExamAttempt {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    examId: string;

    @Column()
    studentId: string;

    @Column({ type: 'timestamp' })
    startedAt: Date;

    @Column({ type: 'timestamp', nullable: true })
    submittedAt: Date;

    @Column({ type: 'jsonb' })
    answers: Array<{ questionId: string; answer: string }>;

    @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
    autoGradeScore: number;

    @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
    manualGradeScore: number;

    @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
    totalScore: number;

    @Column({ default: false })
    isGraded: boolean;

    @Column({ nullable: true })
    gradedBy: string;

    @Column({ type: 'timestamp', nullable: true })
    gradedAt: Date;

    @CreateDateColumn()
    createdAt: Date;
}
