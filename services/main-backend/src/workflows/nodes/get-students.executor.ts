import { Injectable } from '@nestjs/common';
import { NodeExecutor } from './node-executor.interface';
import { StudentsService } from '../../students/students.service';

@Injectable()
export class GetStudentsNodeExecutor implements NodeExecutor {
  constructor(private studentsService: StudentsService) { }

  async execute(node: any, context: any): Promise<any> {
    const { classId, status = 'all', outputKey = 'students' } = node.data;

    console.log(
      `[GetStudentsExecutor] Fetching students (classId: ${classId}, status: ${status})`,
    );

    try {
      const students = await this.studentsService.findAll();

      // Filter by class if specified
      let filteredStudents = students;
      if (classId) {
        filteredStudents = students.filter((s: any) => s.classId === classId);
      }

      // Filter by status if not 'all'
      if (status !== 'all') {
        filteredStudents = filteredStudents.filter(
          (s: any) => s.status === status,
        );
      }

      context[outputKey] = filteredStudents;
      context[`${outputKey}_count`] = filteredStudents.length;

      console.log(
        `[GetStudentsExecutor] Found ${filteredStudents.length} students`,
      );

      return {
        success: true,
        nextNodes: node.data.nextNodes || [],
        context,
      };
    } catch (error: any) {
      console.error('[GetStudentsExecutor] Error:', error.message);
      return {
        success: false,
        error: error.message,
        nextNodes: [],
        context,
      };
    }
  }
  getDefinition(): import('../node-definition.interface').NodeDefinition {
    return {
      type: 'get-students',
      label: 'Get Students',
      category: 'Data',
      description: 'Fetches a list of students.',
      fields: [
        { name: 'classId', label: 'Class', type: 'select', dynamicOptions: 'classes' },
        { name: 'status', label: 'Status', type: 'select', options: [{ label: 'Active', value: 'active' }, { label: 'Inactive', value: 'inactive' }, { label: 'All', value: 'all' }] },
      ],
      inputs: [{ id: 'in', type: 'target', label: 'In' }],
      outputs: [{ id: 'out', type: 'source', label: 'Students' }],
    };
  }
}
