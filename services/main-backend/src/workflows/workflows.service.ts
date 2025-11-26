import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workflow } from './workflow.entity';
import { WorkflowExecution, ExecutionStatus } from './workflow-execution.entity';
import { EmailsService } from '../emails/emails.service';
import { StudentsService } from '../students/students.service';
import { FormsService } from '../forms/forms.service';

export interface CreateWorkflowDto {
    name: string;
    description?: string;
    nodes: Array<{
        id: string;
        type: string;
        position: { x: number; y: number };
        data: any;
    }>;
    edges: Array<{
        id: string;
        source: string;
        target: string;
    }>;
    createdBy: string;
    trigger?: {
        type: 'manual' | 'schedule' | 'event';
        config?: any;
    };
}

@Injectable()
export class WorkflowsService {
    constructor(
        @InjectRepository(Workflow)
        private workflowsRepository: Repository<Workflow>,
        @InjectRepository(WorkflowExecution)
        private executionsRepository: Repository<WorkflowExecution>,
        private emailsService: EmailsService,
        private studentsService: StudentsService,
        private formsService: FormsService,
    ) { }

    // Workflow CRUD
    async findAll(createdBy?: string): Promise<Workflow[]> {
        if (createdBy) {
            return this.workflowsRepository.find({ where: { createdBy } });
        }
        return this.workflowsRepository.find({ order: { createdAt: 'DESC' } });
    }

    async findById(id: string): Promise<Workflow | null> {
        return this.workflowsRepository.findOne({ where: { id } });
    }

    async create(workflowData: CreateWorkflowDto): Promise<Workflow> {
        const workflow = this.workflowsRepository.create({
            ...workflowData,
            isActive: true,
        });
        return this.workflowsRepository.save(workflow);
    }

    async update(id: string, workflowData: Partial<Workflow>): Promise<Workflow> {
        await this.workflowsRepository.update(id, workflowData);
        const workflow = await this.findById(id);
        if (!workflow) {
            throw new Error('Workflow not found');
        }
        return workflow;
    }

    async delete(id: string): Promise<void> {
        await this.workflowsRepository.delete(id);
    }

    // Workflow Execution
    async executeWorkflow(
        workflowId: string,
        triggeredBy: string,
        initialContext: Record<string, any> = {},
    ): Promise<WorkflowExecution> {
        const workflow = await this.findById(workflowId);
        if (!workflow) {
            throw new Error('Workflow not found');
        }

        if (!workflow.isActive) {
            throw new Error('Workflow is not active');
        }

        // Create execution record
        const execution = this.executionsRepository.create({
            workflowId,
            status: ExecutionStatus.RUNNING,
            context: initialContext,
            triggeredBy,
            startedAt: new Date(),
            executedNodes: [],
        });

        const savedExecution = await this.executionsRepository.save(execution);

        // Execute workflow in background
        this.runWorkflow(savedExecution.id, workflow, initialContext).catch(
            (error) => {
                console.error('Workflow execution error:', error);
            },
        );

        return savedExecution;
    }

    private async runWorkflow(
        executionId: string,
        workflow: Workflow,
        context: Record<string, any>,
    ): Promise<void> {
        const execution = await this.executionsRepository.findOne({
            where: { id: executionId },
        });

        if (!execution) return;

        try {
            // Find start node
            const startNode = workflow.nodes.find((n) => n.type === 'start');
            if (!startNode) {
                throw new Error('No start node found');
            }

            // Execute nodes in order
            await this.executeNode(execution, workflow, startNode, context);

            // Mark as completed
            execution.status = ExecutionStatus.COMPLETED;
            execution.completedAt = new Date();
            await this.executionsRepository.save(execution);
        } catch (error: any) {
            execution.status = ExecutionStatus.FAILED;
            execution.errorMessage = error.message;
            execution.completedAt = new Date();
            await this.executionsRepository.save(execution);
        }
    }

    private async executeNode(
        execution: WorkflowExecution,
        workflow: Workflow,
        node: any,
        context: Record<string, any>,
    ): Promise<void> {
        const nodeExecution = {
            nodeId: node.id,
            status: 'running',
            timestamp: new Date().toISOString(),
        };

        try {
            // Execute based on node type
            let result: any;

            switch (node.type) {
                case 'start':
                    result = { message: 'Workflow started' };
                    break;

                case 'sendEmail':
                    result = await this.emailsService.sendEmail({
                        recipients: node.data.recipients || [],
                        subject: node.data.subject || 'No subject',
                        body: node.data.body || '',
                        sentBy: execution.triggeredBy || 'system',
                    });
                    break;

                case 'getStudents':
                    result = await this.studentsService.findAll(node.data.classId);
                    context.students = result;
                    break;

                case 'createForm':
                    result = await this.formsService.create({
                        title: node.data.title,
                        description: node.data.description,
                        fields: node.data.fields || [],
                        createdBy: execution.triggeredBy || 'system',
                    });
                    context.formId = result.id;
                    break;

                case 'condition':
                    // Evaluate condition and choose next path
                    result = this.evaluateCondition(node.data.condition, context);
                    break;

                default:
                    result = { message: `Node type ${node.type} executed` };
            }

            nodeExecution.status = 'completed';
            (nodeExecution as any).result = result;

            execution.executedNodes.push(nodeExecution as any);
            await this.executionsRepository.save(execution);

            // Find and execute next nodes
            const nextEdges = workflow.edges.filter((e) => e.source === node.id);
            for (const edge of nextEdges) {
                const nextNode = workflow.nodes.find((n) => n.id === edge.target);
                if (nextNode) {
                    await this.executeNode(execution, workflow, nextNode, context);
                }
            }
        } catch (error: any) {
            nodeExecution.status = 'failed';
            (nodeExecution as any).error = error.message;
            execution.executedNodes.push(nodeExecution as any);
            await this.executionsRepository.save(execution);
            throw error;
        }
    }

    private evaluateCondition(condition: string, context: Record<string, any>): boolean {
        // Simple condition evaluation (in production, use a safe eval library)
        try {
            // Very basic evaluation - extend as needed
            return Boolean(context[condition]);
        } catch {
            return false;
        }
    }

    // Execution queries
    async getExecutions(workflowId?: string): Promise<WorkflowExecution[]> {
        if (workflowId) {
            return this.executionsRepository.find({
                where: { workflowId },
                order: { createdAt: 'DESC' },
            });
        }
        return this.executionsRepository.find({ order: { createdAt: 'DESC' } });
    }

    async getExecutionById(id: string): Promise<WorkflowExecution | null> {
        return this.executionsRepository.findOne({ where: { id } });
    }

    async cancelExecution(id: string): Promise<WorkflowExecution> {
        const execution = await this.getExecutionById(id);
        if (!execution) {
            throw new Error('Execution not found');
        }

        execution.status = ExecutionStatus.CANCELLED;
        execution.completedAt = new Date();
        return this.executionsRepository.save(execution);
    }
}
