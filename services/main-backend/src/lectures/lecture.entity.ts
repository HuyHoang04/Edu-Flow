import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('lectures')
export class Lecture {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  topic: string;

  @Column({ nullable: true })
  title: string;

  @Column({ type: 'jsonb', nullable: true })
  outline: string[];

  @Column({ type: 'jsonb', nullable: true })
  slides: any[];

  @Column({ nullable: true })
  pptxUrl: string;

  @Column({ nullable: true })
  docxUrl: string;

  @Column({ nullable: true })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
