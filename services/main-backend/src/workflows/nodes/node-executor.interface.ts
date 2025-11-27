import { WorkflowExecution } from '../workflow-execution.entity';

export interface NodeExecutionResult {
    success: boolean;
    output?: any;
    nextNodes?: string[]; // IDs of next nodes to execute (for branching)
    error?: string;
}

export interface NodeExecutor {
    execute(
        node: any,
        context: Record<string, any>,
        execution: WorkflowExecution,
        workflow?: any, // Added workflow to access edges/nodes
    ): Promise<NodeExecutionResult>;
}
