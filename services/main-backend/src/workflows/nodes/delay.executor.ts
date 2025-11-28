import { Injectable } from '@nestjs/common';
import { NodeExecutor } from './node-executor.interface';

@Injectable()
export class DelayNodeExecutor implements NodeExecutor {
  async execute(node: any, context: any): Promise<any> {
    const { duration = 1000 } = node.data;

    console.log(`[DelayExecutor] Waiting for ${duration}ms...`);

    await new Promise((resolve) => setTimeout(resolve, duration));

    console.log(`[DelayExecutor] Delay completed`);

    return {
      success: true,
      nextNodes: node.data.nextNodes || [],
      context,
    };
  }
  getDefinition(): import('../node-definition.interface').NodeDefinition {
    return {
      type: 'delay',
      label: 'Delay',
      category: 'Logic',
      description: 'Pauses execution for a duration.',
      fields: [
        { name: 'duration', label: 'Duration (ms)', type: 'number', defaultValue: 1000 },
      ],
      inputs: [{ id: 'in', type: 'target', label: 'In' }],
      outputs: [{ id: 'out', type: 'source', label: 'After Delay' }],
    };
  }
}
