import { NodeExecutor, NodeExecutionResult } from './node-executor.interface';
import { WorkflowExecution } from '../workflow-execution.entity';

export abstract class BaseNodeExecutor implements NodeExecutor {
  abstract execute(
    node: any,
    context: Record<string, any>,
    execution: WorkflowExecution,
  ): Promise<NodeExecutionResult>;

  abstract getDefinition(): import('../node-definition.interface').NodeDefinition;

  protected getInputValue(
    node: any,
    fieldName: string,
    context: Record<string, any>,
  ): any {
    const value = node.data[fieldName];

    if (typeof value === 'string') {
      return this.resolveVariables(value, context);
    }

    return value;
  }

  private resolveVariables(text: string, context: Record<string, any>): any {
    // Handle simple variable access: {{variable}}
    // Also handle nested access: {{variable.property}}
    const regex = /\{\{([^}]+)\}\}/g;

    // If the text IS exactly a variable (e.g. "{{student}}"), return the object directly
    if (text.match(/^\{\{([^}]+)\}\}$/)) {
      const match = regex.exec(text);
      if (match) {
        const path = match[1].trim();
        return this.getValueFromPath(context, path);
      }
    }

    // Otherwise, replace variables in the string
    return text.replace(regex, (match, variable) => {
      const val = this.getValueFromPath(context, variable.trim());
      return val !== undefined ? String(val) : match;
    });
  }

  private getValueFromPath(obj: any, path: string): any {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  }
}
