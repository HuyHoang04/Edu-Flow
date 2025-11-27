import { Injectable } from '@nestjs/common';
import { NodeExecutor, NodeExecutionResult } from './node-executor.interface';

@Injectable()
export class LoopNodeExecutor implements NodeExecutor {
  async execute(
    node: any,
    context: any,
    execution: any,
    workflow?: any,
  ): Promise<NodeExecutionResult> {
    console.log(`[LoopNode] Executing for node: ${node.id}`);

    const loopId = `loop_${node.id}`;
    const itemsKey = node.data.items; // e.g., "students" (key in context) or raw array

    // Initialize loop state if not present
    if (!context[loopId]) {
      let items: any[] = [];
      if (Array.isArray(itemsKey)) {
        items = itemsKey;
      } else if (typeof itemsKey === 'string' && context[itemsKey]) {
        items = context[itemsKey];
      } else {
        console.warn(
          `[LoopNode] Items source '${itemsKey}' not found or invalid`,
        );
      }

      context[loopId] = {
        items: items,
        currentIndex: 0,
        total: items.length,
      };
      console.log(`[LoopNode] Initialized loop with ${items.length} items`);
    }

    const loopState = context[loopId];

    if (loopState.currentIndex < loopState.total) {
      // Get current item
      const currentItem = loopState.items[loopState.currentIndex];

      // Update context with current item (using a generic key like 'currentItem' or specific one)
      // Ideally node.data.currentItemKey tells us where to put it. Default to 'currentItem'.
      const itemKey = node.data.currentItemKey || 'currentItem';

      // Increment index for NEXT iteration (but we do it here? No, we do it after body?)
      // Actually, if we loop back to this node, we need to increment.
      // So we increment NOW, and return the item corresponding to the index we just processed?
      // Or we return item at currentIndex, and increment.

      loopState.currentIndex++;

      console.log(
        `[LoopNode] Iteration ${loopState.currentIndex}/${loopState.total}`,
      );

      return {
        success: true,
        output: {
          [itemKey]: currentItem,
          loopIndex: loopState.currentIndex - 1,
          [loopId]: loopState,
        },
        // We need to return nextNodes pointing to the "Body" path.
        // We assume the edge connected to "body" handle has sourceHandle='body'
        // If we don't return nextNodes, the service executes ALL outputs.
        // We want to execute ONLY "body".
        // We'll rely on the service to filter based on our output or we filter here if we have workflow.
      };
    } else {
      // Loop finished
      console.log(`[LoopNode] Loop finished`);
      // Cleanup loop state? Maybe keep it for history.
      // delete context[loopId];

      return {
        success: true,
        output: {
          loopFinished: true,
        },
        // We want to execute ONLY "done" path.
      };
    }
  }
}
