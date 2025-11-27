import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('workflows')
export class Workflow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb' })
  nodes: Array<{
    id: string;
    type: string;
    position: { x: number; y: number };
    data: any;
  }>;

  @Column({ type: 'jsonb' })
  edges: Array<{
    id: string;
    source: string;
    target: string;
  }>;

  @Column()
  createdBy: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isTemplate: boolean;

  @Column({ nullable: true })
  category: string; // For templates: 'education', 'automation', 'notification', etc.

  @Column({ type: 'jsonb', nullable: true })
  trigger: {
    type: 'manual' | 'schedule' | 'event';
    config?: any;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
