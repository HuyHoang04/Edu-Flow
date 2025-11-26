import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
} from 'typeorm';

@Entity('attendance')
export class Attendance {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    studentId: string;

    @Column()
    classId: string;

    @Column({ nullable: true })
    scheduleId: string;

    @Column({ type: 'date' })
    date: Date;

    @Column({ default: 'present' })
    status: string; // present, absent, late, excused

    @Column({ type: 'text', nullable: true })
    note: string;

    @CreateDateColumn()
    createdAt: Date;
}
