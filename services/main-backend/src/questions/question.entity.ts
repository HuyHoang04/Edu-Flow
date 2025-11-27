import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

export enum QuestionType {
    MULTIPLE_CHOICE = 'multiple_choice',
    TRUE_FALSE = 'true_false',
    SHORT_ANSWER = 'short_answer',
    ESSAY = 'essay',
}

export enum QuestionDifficulty {
    EASY = 'easy',
    MEDIUM = 'medium',
    HARD = 'hard',
}

@Entity('questions')
export class Question {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'text' })
    content: string;

    @Column({
        type: 'enum',
        enum: QuestionType,
        default: QuestionType.MULTIPLE_CHOICE,
    })
    type: QuestionType;

    @Column({ type: 'jsonb', nullable: true })
    options: string[]; // For multiple choice

    @Column({ type: 'text' })
    correctAnswer: string;

    @Column({ type: 'decimal', precision: 5, scale: 2, default: 1 })
    points: number;

    @Column({
        type: 'enum',
        enum: QuestionDifficulty,
        default: QuestionDifficulty.MEDIUM,
    })
    difficulty: QuestionDifficulty;

    @Column()
    subject: string;

    @Column({ nullable: true })
    topic: string;

    @Column({ type: 'jsonb', default: [] })
    tags: string[];

    @Column({ type: 'text', nullable: true })
    explanation: string;

    @Column()
    createdBy: string; // User ID

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
