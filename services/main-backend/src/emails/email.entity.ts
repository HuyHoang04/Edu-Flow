import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('emails')
export class Email {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  subject: string;

  @Column({ type: 'text' })
  body: string;

  @Column({ type: 'jsonb' })
  recipients: string[]; // Email addresses

  @Column()
  sentBy: string; // User ID

  @Column({ default: 'pending' })
  status: string; // pending, sent, failed

  @Column({ nullable: true })
  sentAt: Date;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>; // Template variables, class info, etc.

  @CreateDateColumn()
  createdAt: Date;
}
