import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('attendance_sessions')
export class AttendanceSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  classId: string;

  @Column({ nullable: true })
  scheduleId: string;

  @Column({ unique: true })
  code: string; // e.g. "123456"

  @Column({ type: 'timestamptz', nullable: true })
  expiryTime: Date;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
