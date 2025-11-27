import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
} from 'typeorm';
import { Class } from '../classes/class.entity';

@Entity('schedules')
export class Schedule {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    classId: string;

    @ManyToOne(() => Class, (cls) => cls.schedules)
    class: Class;

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
