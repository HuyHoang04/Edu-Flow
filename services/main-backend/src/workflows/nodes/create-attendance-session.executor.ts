import { Injectable } from '@nestjs/common';
import { NodeExecutor, NodeExecutionResult } from './node-executor.interface';
import { AttendanceService } from '../../attendance/attendance.service';

@Injectable()
export class CreateAttendanceSessionExecutor implements NodeExecutor {
  constructor(private readonly attendanceService: AttendanceService) { }

  async execute(node: any, context: any): Promise<NodeExecutionResult> {
    const { classId, timeout } = node.data;

    // Use context variables if available (e.g. from schedule trigger)
    const finalClassId = classId || context.classId;
    const scheduleId = context.scheduleId;
    const timeoutMinutes = timeout || 5;

    if (!finalClassId) {
      throw new Error('Class ID is required for creating attendance session');
    }

    const session = await this.attendanceService.createSession({
      classId: finalClassId,
      scheduleId,
      timeoutMinutes,
    });

    const checkinUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/attendance/join/${session.code}`;

    // Update context with session details
    context.sessionCode = session.code;
    context.expiryTime = session.expiryTime.toISOString();
    context.checkinUrl = checkinUrl;
    context.sessionId = session.id;

    return {
      success: true,
      output: {
        sessionCode: session.code,
        expiryTime: session.expiryTime,
        checkinUrl,
      },
    };
  }
  getDefinition(): import('../node-definition.interface').NodeDefinition {
    return {
      type: 'create-attendance-session',
      label: 'Create Attendance Code',
      category: 'Action',
      description: 'Generates a unique check-in code.',
      fields: [
        { name: 'classId', label: 'Class', type: 'select', dynamicOptions: 'classes' },
        { name: 'timeout', label: 'Timeout (minutes)', type: 'number', defaultValue: 5 },
      ],
      inputs: [{ id: 'in', type: 'target', label: 'In' }],
      outputs: [{ id: 'out', type: 'source', label: 'Created' }],
      outputVariables: [
        { name: 'sessionCode', label: 'Unique Code', description: 'The 4-6 digit check-in code' },
        { name: 'expiryTime', label: 'Expiry Time', description: 'When the code expires' },
        { name: 'checkinUrl', label: 'Check-in URL', description: 'Direct link for students' }
      ]
    };
  }
}
