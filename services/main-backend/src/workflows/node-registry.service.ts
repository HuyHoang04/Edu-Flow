import { Injectable, OnModuleInit } from '@nestjs/common';
import { NodeExecutor } from './nodes/node-executor.interface';
import { ManualTriggerExecutor } from './nodes/manual-trigger.executor';
import { SendEmailNodeExecutor } from './nodes/send-email.executor';
import { CreateExamNodeExecutor } from './nodes/create-exam.executor';
import { AssignGradeNodeExecutor } from './nodes/assign-grade.executor';
import { UpdateStudentNodeExecutor } from './nodes/update-student.executor';
import { ConditionNodeExecutor } from './nodes/condition.executor';
import { LoopNodeExecutor } from './nodes/loop.executor';
import { AIGenerateExecutor } from './nodes/ai-generate.executor';
import { AIGradeExecutor } from './nodes/ai-grade.executor';
import { DelayNodeExecutor } from './nodes/delay.executor';
import { GetStudentsNodeExecutor } from './nodes/get-students.executor';
import { GetClassesNodeExecutor } from './nodes/get-classes.executor';
import { GetExamResultsNodeExecutor } from './nodes/get-exam-results.executor';

import { CreateAttendanceSessionExecutor } from './nodes/create-attendance-session.executor';
import { SendNotificationExecutor } from './nodes/send-notification.executor';

@Injectable()
export class NodeRegistryService implements OnModuleInit {
  private executors = new Map<string, NodeExecutor>();

  constructor(
    private manualTrigger: ManualTriggerExecutor,
    private sendEmail: SendEmailNodeExecutor,
    private createExam: CreateExamNodeExecutor,
    private assignGrade: AssignGradeNodeExecutor,
    private updateStudent: UpdateStudentNodeExecutor,
    private condition: ConditionNodeExecutor,
    private loop: LoopNodeExecutor,
    private aiGenerate: AIGenerateExecutor,
    private aiGrade: AIGradeExecutor,
    private delay: DelayNodeExecutor,
    private getStudents: GetStudentsNodeExecutor,
    private getClasses: GetClassesNodeExecutor,
    private getExamResults: GetExamResultsNodeExecutor,
    private createAttendanceSession: CreateAttendanceSessionExecutor,
    private sendNotification: SendNotificationExecutor,
  ) {}

  onModuleInit() {
    this.register('manual-trigger', this.manualTrigger);
    this.register('send-email', this.sendEmail);
    this.register('create-exam', this.createExam);
    this.register('assign-grade', this.assignGrade);
    this.register('update-student', this.updateStudent);
    this.register('condition', this.condition);
    this.register('loop', this.loop);
    this.register('ai-generate', this.aiGenerate);
    this.register('ai-grade', this.aiGrade);
    this.register('delay', this.delay);
    this.register('get-students', this.getStudents);
    this.register('get-classes', this.getClasses);
    this.register('get-exam-results', this.getExamResults);
    this.register('create-attendance-session', this.createAttendanceSession);
    this.register('send-notification', this.sendNotification);
  }

  register(type: string, executor: NodeExecutor) {
    this.executors.set(type, executor);
    console.log(`[NodeRegistry] Registered executor for: ${type}`);
  }

  getExecutor(type: string): NodeExecutor | undefined {
    return this.executors.get(type);
  }
}
