import { Injectable } from '@nestjs/common';
import { NodeExecutor, NodeExecutionResult } from './node-executor.interface';
import { StudentsService } from '../../students/students.service';

@Injectable()
export class UpdateStudentNodeExecutor implements NodeExecutor {
  constructor(private studentsService: StudentsService) {}

  async execute(
    node: any,
    context: any,
    execution: any,
    workflow?: any,
  ): Promise<NodeExecutionResult> {
    console.log(`[UpdateStudentNode] Executing for node: ${node.id}`);

    const { studentId, updates } = node.data;
    const targetStudentId = studentId || context.studentId;

    if (!targetStudentId) {
      console.warn('[UpdateStudentNode] No studentId found in data or context');
      return { success: false, error: 'No studentId provided' };
    }

    // Parse updates if it's a string (JSON) or use as object
    let updateData = updates;
    if (typeof updates === 'string') {
      try {
        updateData = JSON.parse(updates);
      } catch (e) {
        console.warn('[UpdateStudentNode] Failed to parse updates JSON', e);
      }
    }

    // Update the student
    const updatedStudent = await this.studentsService.update(
      targetStudentId,
      updateData,
    );

    console.log(`[UpdateStudentNode] Updated student: ${updatedStudent.id}`);

    context.updatedStudent = updatedStudent;

    return {
      success: true,
      output: {
        updatedStudent,
      },
    };
  }
}
