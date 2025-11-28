import { Injectable } from '@nestjs/common';
import { NodeExecutor, NodeExecutionResult } from './node-executor.interface';

@Injectable()
export class ConditionNodeExecutor implements NodeExecutor {
  async execute(
    node: any,
    context: any,
    execution: any,
    workflow?: any,
  ): Promise<NodeExecutionResult> {
    console.log(`[ConditionNode] Executing for node: ${node.id}`);

    const { condition, trueLabel, falseLabel } = node.data;
    // condition example: "score > 50" or structured { field: 'score', operator: '>', value: 50 }

    let result = false;

    try {
      if (typeof condition === 'string') {
        // Simple string evaluation (very basic)
        const parts = condition.split(' ');
        if (parts.length === 3 && !parts[0].includes('.')) {
          const [leftKey, operator, rightVal] = parts;
          const leftValue =
            context[leftKey] !== undefined ? context[leftKey] : Number(leftKey);
          const rightValue = !isNaN(Number(rightVal))
            ? Number(rightVal)
            : rightVal;

          switch (operator) {
            case '>':
              result = leftValue > rightValue;
              break;
            case '<':
              result = leftValue < rightValue;
              break;
            case '>=':
              result = leftValue >= rightValue;
              break;
            case '<=':
              result = leftValue <= rightValue;
              break;
            case '==':
              result = leftValue == rightValue;
              break;
            case '!=':
              result = leftValue != rightValue;
              break;
            default:
              console.warn(`[ConditionNode] Unknown operator: ${operator}`);
          }
        } else {
          // Fallback to evaluating as JS expression
          console.log(
            '[ConditionNode] Evaluating as JS expression:',
            condition,
          );
          console.log('[ConditionNode] Context keys:', Object.keys(context));
          try {
            const keys = Object.keys(context);
            const values = Object.values(context);
            const func = new Function(...keys, `return ${condition};`);
            result = func(...values);
          } catch (evalError) {
            console.error('[ConditionNode] JS Evaluation failed:', evalError);
          }
        }
      }
    } catch (error) {
      console.error('[ConditionNode] Evaluation error:', error);
      result = false;
    }

    console.log(`[ConditionNode] Result: ${result}`);

    let nextNodes: string[] = [];
    if (workflow && workflow.edges) {
      const targetHandle = result ? 'true' : 'false';
      // Find edges connected to this node's specific source handle
      const edges = workflow.edges.filter(
        (e: any) =>
          e.source === node.id &&
          (e.sourceHandle === targetHandle ||
            e.sourceHandle === (result ? trueLabel : falseLabel)),
      );
      nextNodes = edges.map((e: any) => e.target);
      console.log(
        `[ConditionNode] Next nodes for ${targetHandle}: ${nextNodes.join(', ')}`,
      );
    }

    return {
      success: true,
      output: { conditionResult: result },
      nextNodes: nextNodes,
    };
  }
  getDefinition(): import('../node-definition.interface').NodeDefinition {
    return {
      type: 'condition',
      label: 'Condition (If/Else)',
      category: 'Logic',
      description: 'Checks a condition.',
      fields: [
        { name: 'variable', label: 'Variable', type: 'text' },
        { name: 'operator', label: 'Operator', type: 'select', options: [{ label: 'Equals', value: 'eq' }, { label: 'Contains', value: 'contains' }, { label: 'Greater Than', value: 'gt' }] },
        { name: 'value', label: 'Value', type: 'text' },
      ],
      inputs: [{ id: 'in', type: 'target', label: 'In' }],
      outputs: [
        { id: 'true', type: 'source', label: 'True' },
        { id: 'false', type: 'source', label: 'False' }
      ],
    };
  }
}
