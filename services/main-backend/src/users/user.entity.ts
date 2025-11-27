import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  avatarUrl: string;

  @Column({ default: 'teacher' })
  role: string;

  @Column({ unique: true })
  googleId: string;

  @Column({ nullable: true, type: 'text' })
  accessToken: string; // Gmail access token (encrypted)

  @Column({ nullable: true, type: 'text' })
  refreshToken: string; // Gmail refresh token (encrypted)

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  lastLogin: Date;
}
