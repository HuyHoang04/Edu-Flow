import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('form_responses')
export class FormResponse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  formId: string;

  @Column()
  respondentEmail: string;

  @Column({ nullable: true })
  respondentName: string;

  @Column({ type: 'jsonb' })
  answers: Record<string, any>; // fieldId -> answer

  @CreateDateColumn()
  submittedAt: Date;
}
