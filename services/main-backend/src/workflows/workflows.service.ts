import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workflow } from './workflow.entity';
import { WorkflowExecution, ExecutionStatus } from './workflow-execution.entity';
import { NodeRegistryService } from './node-registry.service';

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
        private nodeRegistry: NodeRegistryService,
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

    // Template Management
    async findAllTemplates(): Promise<Workflow[]> {
        return this.workflowsRepository.find({
            where: { isTemplate: true },
            order: { createdAt: 'DESC' }
        });
    }

    async saveAsTemplate(
        workflowId: string,
        templateData: { name?: string; description?: string; category?: string; createdBy?: string }
    ): Promise<Workflow> {
        const workflow = await this.findById(workflowId);
        if (!workflow) {
            throw new Error('Workflow not found');
        }

        const template = this.workflowsRepository.create({
            name: templateData.name || `${workflow.name} (Template)`,
            description: templateData.description || workflow.description,
            category: templateData.category,
            nodes: workflow.nodes,
            edges: workflow.edges,
            trigger: workflow.trigger,
            isTemplate: true,
            isActive: true,
            createdBy: templateData.createdBy || workflow.createdBy
        });

        return this.workflowsRepository.save(template);
    }

    async useTemplate(
        templateId: string,
        workflowData: { name?: string; createdBy?: string }
    ): Promise<Workflow> {
        const template = await this.findById(templateId);
        if (!template) {
            throw new Error('Template not found');
        }

        if (!template.isTemplate) {
            throw new Error('This is not a template');
        }

        const workflow = this.workflowsRepository.create({
            name: workflowData.name || `Copy of ${template.name}`,
            description: template.description,
            nodes: template.nodes,
            edges: template.edges,
            trigger: template.trigger,
            isTemplate: false,
            isActive: true,
            createdBy: workflowData.createdBy || template.createdBy
        });

        return this.workflowsRepository.save(workflow);
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
            console.log('Workflow Nodes:', JSON.stringify(workflow.nodes, null, 2));

            // Find start node
            let startNode;
            if (execution.triggeredBy === 'manual') {
                startNode = workflow.nodes.find(n => n.data.nodeType === 'manual-trigger');
            } else {
                // Default to first node or specific trigger logic
                startNode = workflow.nodes.find(n => n.type === 'trigger' || n.data.category === 'Trigger');
            }

            if (!startNode) {
                throw new Error('No start node found');
            }

            console.log(`[Workflow] Starting execution from node: ${startNode.id}`);
            await this.executeNode(execution, workflow, startNode, context);

            execution.status = ExecutionStatus.COMPLETED;
            execution.completedAt = new Date();
            await this.executionsRepository.save(execution);
        } catch (error: any) {
            console.error('[Workflow] Execution failed:', error);
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
            const nodeType = node.data.nodeType;
            const executor = this.nodeRegistry.getExecutor(nodeType);

            let result: any;
            let nextNodes: string[] = [];

            if (executor) {
                const executionResult = await executor.execute(node, context, execution, workflow);
                if (!executionResult.success) {
                    throw new Error(executionResult.error || 'Node execution failed');
                }
                result = executionResult.output;

                // If executor returns specific next nodes (e.g. ConditionNode), use them
                if (executionResult.nextNodes) {
                    nextNodes = executionResult.nextNodes;
                }
            } else {
                console.warn(`No executor found for type: ${nodeType}`);
                result = { message: `Node type ${nodeType} skipped (no executor)` };
            }

            nodeExecution.status = 'completed';
            (nodeExecution as any).result = result;

            execution.executedNodes.push(nodeExecution as any);
            await this.executionsRepository.save(execution);

            // Determine next nodes if not already decided by executor
            if (nextNodes.length === 0) {
                const nextEdges = workflow.edges.filter((e) => e.source === node.id);
                nextNodes = nextEdges.map(e => e.target);
            }

            // Execute next nodes
            for (const nextNodeId of nextNodes) {
                const nextNode = workflow.nodes.find((n) => n.id === nextNodeId);
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
