import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
} from 'typeorm';

@Entity('schedules')
export class Schedule {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    classId: string;

    @Column()
    dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.

    @Column({ type: 'time' })
    startTime: string;

    @Column({ type: 'time' })
    endTime: string;

    @Column({ nullable: true })
    room: string;

    @CreateDateColumn()
    createdAt: Date;
}
