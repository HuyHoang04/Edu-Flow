import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Workflow } from './workflow.entity';
import { WorkflowExecution } from './workflow-execution.entity';
import { WorkflowsService } from './workflows.service';
import { WorkflowsController } from './workflows.controller';
import { EmailsModule } from '../emails/emails.module';
import { StudentsModule } from '../students/students.module';
import { FormsModule } from '../forms/forms.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Workflow, WorkflowExecution]),
        EmailsModule,
        StudentsModule,
        FormsModule,
    ],
    controllers: [WorkflowsController],
    providers: [WorkflowsService],
    exports: [WorkflowsService],
})
export class WorkflowsModule { }
