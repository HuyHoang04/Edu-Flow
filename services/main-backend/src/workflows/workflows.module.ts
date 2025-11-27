import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Workflow } from './workflow.entity';
import { WorkflowExecution } from './workflow-execution.entity';
import { WorkflowsService } from './workflows.service';
import { WorkflowsController } from './workflows.controller';
import { EmailsModule } from '../emails/emails.module';
import { StudentsModule } from '../students/students.module';
import { FormsModule } from '../forms/forms.module';
import { NodeRegistryService } from './node-registry.service';
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
import { FormNodeExecutor } from './nodes/form.executor';
import { ReportNodeExecutor } from './nodes/report.executor';
import { WorkflowSchedulerService } from './workflow-scheduler.service';
import { Class } from '../classes/class.entity';
import { ExamResult } from '../exams/exam-result.entity';
import { ExamsModule } from '../exams/exams.module';
import { QuestionsModule } from '../questions/questions.module';
import { ReportsModule } from '../reports/reports.module';
import { AttendanceModule } from '../attendance/attendance.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { CreateAttendanceSessionExecutor } from './nodes/create-attendance-session.executor';
import { SendNotificationExecutor } from './nodes/send-notification.executor';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workflow, WorkflowExecution, Class, ExamResult]),
    EmailsModule,
    StudentsModule,
    StudentsModule,
    forwardRef(() => ExamsModule),
    QuestionsModule,
    FormsModule,
    ReportsModule,
    AttendanceModule,
    NotificationsModule,
  ],
  controllers: [WorkflowsController],
  providers: [
    WorkflowsService,
    WorkflowSchedulerService,
    NodeRegistryService,
    ManualTriggerExecutor,
    SendEmailNodeExecutor,
    CreateExamNodeExecutor,
    AssignGradeNodeExecutor,
    UpdateStudentNodeExecutor,
    ConditionNodeExecutor,
    LoopNodeExecutor,
    AIGenerateExecutor,
    AIGradeExecutor,
    DelayNodeExecutor,
    GetStudentsNodeExecutor,
    GetClassesNodeExecutor,
    GetExamResultsNodeExecutor,
    FormNodeExecutor,
    ReportNodeExecutor,
    CreateAttendanceSessionExecutor,
    SendNotificationExecutor,
  ],
  exports: [WorkflowsService],
})
export class WorkflowsModule {}
