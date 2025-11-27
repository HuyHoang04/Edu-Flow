import { Workflow } from "@/types/workflow";

/**
 * Helper: Generate cron expression from schedule
 * @param dayOfWeek 0 = Sunday, 1 = Monday, etc.
 * @param startTime "HH:mm" format
 * @param minutesBefore How many minutes before class to trigger
 */
export function generateCronForSchedule(
    dayOfWeek: number,
    startTime: string,
    minutesBefore: number = 15
): string {
    const [hour, minute] = startTime.split(':').map(Number);

    // Calculate trigger time
    let triggerMinute = minute - minutesBefore;
    let triggerHour = hour;

    if (triggerMinute < 0) {
        triggerMinute = 60 + triggerMinute;
        triggerHour = hour - 1;
    }

    // Cron format: minute hour dayOfMonth month dayOfWeek
    return `${triggerMinute} ${triggerHour} * * ${dayOfWeek}`;
}

/**
 * Workflow Templates for Schedules
 */

export const SCHEDULE_WORKFLOW_TEMPLATES = {
    /**
     * Template 1: Auto Attendance Link
     * Tự động gửi link điểm danh 15 phút trước giờ học
     */
    'attendance-link': (schedule: {
        id: string;
        classId: string;
        className: string;
        dayOfWeek: number;
        startTime: string;
        endTime: string;
        room: string;
    }): Partial<Workflow> => ({
        name: `Auto Attendance Link - ${schedule.className}`,
        description: `Tự động gửi link điểm danh 15 phút trước tiết ${schedule.className}`,
        trigger: {
            type: 'schedule',
            config: {
                cron: generateCronForSchedule(schedule.dayOfWeek, schedule.startTime, 15),
                timezone: 'Asia/Ho_Chi_Minh'
            }
        },
        startNodeId: 'create-session',
        nodes: [
            {
                id: 'create-session',
                type: 'custom',
                position: { x: 250, y: 50 },
                data: {
                    label: 'Create Attendance Session',
                    category: 'Action',
                    nodeType: 'create-attendance-session',
                    scheduleId: schedule.id,
                    classId: schedule.classId,
                    durationHours: 2
                }
            },
            {
                id: 'get-students',
                type: 'custom',
                position: { x: 250, y: 200 },
                data: {
                    label: 'Get Students',
                    category: 'Data',
                    nodeType: 'get-students',
                    classId: schedule.classId,
                    status: 'active'
                }
            },
            {
                id: 'send-email',
                type: 'custom',
                position: { x: 250, y: 350 },
                data: {
                    label: 'Send Email',
                    category: 'Action',
                    nodeType: 'send-email',
                    to: '{{students}}',
                    subject: `Điểm danh ${schedule.className} - ${schedule.startTime}`,
                    body: `Xin chào,

Tiết ${schedule.className} sắp bắt đầu!

📅 Thời gian: ${schedule.startTime} - ${schedule.endTime}
📍 Phòng: ${schedule.room}

Vui lòng điểm danh bằng một trong hai cách:

1️⃣ Click link: {{attendanceUrl}}
2️⃣ Hoặc nhập mã: {{attendanceCode}}

⏰ Link có hiệu lực đến 11:00

Trân trọng,
Hệ thống Edu-Flow`
                }
            }
        ],
        edges: [
            { id: 'e1', source: 'create-session', target: 'get-students' },
            { id: 'e2', source: 'get-students', target: 'send-email' }
        ],
        isActive: false // User needs to activate manually
    }),

    /**
     * Template 2: Attendance Reminder for Teachers
     * Nhắc nhở giáo viên điểm danh
     */
    'teacher-reminder': (schedule: {
        id: string;
        classId: string;
        className: string;
        dayOfWeek: number;
        startTime: string;
        endTime: string;
        room: string;
        teacherEmail?: string;
    }): Partial<Workflow> => ({
        name: `Attendance Reminder - ${schedule.className}`,
        description: `Nhắc nhở giáo viên điểm danh cho lớp ${schedule.className}`,
        trigger: {
            type: 'schedule',
            config: {
                cron: generateCronForSchedule(schedule.dayOfWeek, schedule.startTime, 5), // 5 mins before
                timezone: 'Asia/Ho_Chi_Minh'
            }
        },
        startNodeId: 'send-reminder',
        nodes: [
            {
                id: 'send-reminder',
                type: 'custom',
                position: { x: 250, y: 100 },
                data: {
                    label: 'Send Reminder Email',
                    category: 'Action',
                    nodeType: 'send-email',
                    to: schedule.teacherEmail || 'teacher@school.edu',
                    subject: `Nhắc nhở: Điểm danh lớp ${schedule.className}`,
                    body: `Xin chào,

Tiết học ${schedule.className} đang bắt đầu.
Vui lòng điểm danh học sinh.

📍 Phòng: ${schedule.room}
⏰ ${schedule.startTime} - ${schedule.endTime}

Trân trọng,
Hệ thống Edu-Flow`
                }
            }
        ],
        edges: [],
        isActive: false
    }),

    /**
     * Template 3: Weekly Attendance Report
     * Báo cáo điểm danh hàng tuần
     */
    'weekly-report': (schedule: {
        id: string;
        classId: string;
        className: string;
        teacherEmail?: string;
    }): Partial<Workflow> => ({
        name: `Weekly Attendance Report - ${schedule.className}`,
        description: `Báo cáo điểm danh hàng tuần cho lớp ${schedule.className}`,
        trigger: {
            type: 'schedule',
            config: {
                cron: '0 18 * * 5', // 6 PM every Friday
                timezone: 'Asia/Ho_Chi_Minh'
            }
        },
        startNodeId: 'get-attendance',
        nodes: [
            {
                id: 'get-attendance',
                type: 'custom',
                position: { x: 250, y: 50 },
                data: {
                    label: 'Get Weekly Attendance',
                    category: 'Data',
                    nodeType: 'get-attendance',
                    classId: schedule.classId,
                    startDate: '{{week_start}}',
                    endDate: '{{week_end}}',
                    status: 'all'
                }
            },
            {
                id: 'generate-report',
                type: 'custom',
                position: { x: 250, y: 200 },
                data: {
                    label: 'Generate Report',
                    category: 'Action',
                    nodeType: 'generate-report',
                    reportType: 'attendance',
                    classId: schedule.classId,
                    startDate: '{{week_start}}',
                    endDate: '{{week_end}}'
                }
            },
            {
                id: 'send-email',
                type: 'custom',
                position: { x: 250, y: 350 },
                data: {
                    label: 'Send Report',
                    category: 'Action',
                    nodeType: 'send-email',
                    to: schedule.teacherEmail || 'teacher@school.edu',
                    subject: `Báo cáo điểm danh tuần - ${schedule.className}`,
                    body: `Xin chào,

Báo cáo điểm danh lớp ${schedule.className} trong tuần qua:

📊 Tổng số buổi: {{totalSessions}}
✅ Tổng có mặt: {{totalPresent}}
❌ Tổng vắng: {{totalAbsent}}
📈 Tỷ lệ: {{attendanceRate}}%

Chi tiết: {{reportUrl}}

Trân trọng,
Hệ thống Edu-Flow`
                }
            }
        ],
        edges: [
            { id: 'e1', source: 'get-attendance', target: 'generate-report' },
            { id: 'e2', source: 'generate-report', target: 'send-email' }
        ],
        isActive: false
    }),

    /**
     * Template 4: Low Attendance Alert
     * Cảnh báo khi điểm danh thấp
     */
    'low-attendance-alert': (schedule: {
        id: string;
        classId: string;
        className: string;
    }): Partial<Workflow> => ({
        name: `Low Attendance Alert - ${schedule.className}`,
        description: `Cảnh báo khi tỷ lệ điểm danh thấp hơn 80%`,
        trigger: {
            type: 'event',
            config: {
                event: 'ATTENDANCE_RECORDED'
            }
        },
        startNodeId: 'get-student-attendance',
        nodes: [
            {
                id: 'get-student-attendance',
                type: 'custom',
                position: { x: 250, y: 50 },
                data: {
                    label: 'Get Student Attendance',
                    category: 'Data',
                    nodeType: 'get-attendance',
                    studentId: '{{studentId}}',
                    classId: schedule.classId,
                    startDate: '{{month_start}}',
                    endDate: '{{month_end}}'
                }
            },
            {
                id: 'check-rate',
                type: 'custom',
                position: { x: 250, y: 200 },
                data: {
                    label: 'Check Attendance Rate',
                    category: 'Logic',
                    nodeType: 'condition',
                    variable: 'attendanceRate',
                    operator: 'lt',
                    value: '80'
                }
            },
            {
                id: 'get-student',
                type: 'custom',
                position: { x: 100, y: 350 },
                data: {
                    label: 'Get Student Info',
                    category: 'Data',
                    nodeType: 'get-students',
                    classId: schedule.classId,
                    status: 'active'
                }
            },
            {
                id: 'send-alert',
                type: 'custom',
                position: { x: 100, y: 500 },
                data: {
                    label: 'Send Alert',
                    category: 'Action',
                    nodeType: 'send-email',
                    to: '{{student.email}}',
                    subject: `Cảnh báo: Điểm danh thấp - ${schedule.className}`,
                    body: `Xin chào {{student.name}},

Tỷ lệ điểm danh của bạn trong lớp ${schedule.className} đang thấp: {{attendanceRate}}%

Vui lòng chú ý tham gia đầy đủ các buổi học.

Trân trọng,
Hệ thống Edu-Flow`
                }
            }
        ],
        edges: [
            { id: 'e1', source: 'get-student-attendance', target: 'check-rate' },
            { id: 'e2', source: 'check-rate', target: 'get-student', sourceHandle: 'true' },
            { id: 'e3', source: 'get-student', target: 'send-alert' }
        ],
        isActive: false
    }),

    /**
     * Template 5: Absence Notification to Parents
     * Thông báo vắng mặt cho phụ huynh
     */
    'absence-notification': (schedule: {
        id: string;
        classId: string;
        className: string;
    }): Partial<Workflow> => ({
        name: `Absence Notification - ${schedule.className}`,
        description: `Thông báo cho phụ huynh khi học sinh vắng mặt`,
        trigger: {
            type: 'event',
            config: {
                event: 'ATTENDANCE_RECORDED'
            }
        },
        startNodeId: 'check-absent',
        nodes: [
            {
                id: 'check-absent',
                type: 'custom',
                position: { x: 250, y: 50 },
                data: {
                    label: 'Check if Absent',
                    category: 'Logic',
                    nodeType: 'condition',
                    variable: 'status',
                    operator: 'eq',
                    value: 'absent'
                }
            },
            {
                id: 'get-student',
                type: 'custom',
                position: { x: 100, y: 200 },
                data: {
                    label: 'Get Student Info',
                    category: 'Data',
                    nodeType: 'get-students',
                    status: 'active'
                }
            },
            {
                id: 'send-notification',
                type: 'custom',
                position: { x: 100, y: 350 },
                data: {
                    label: 'Notify Parent',
                    category: 'Action',
                    nodeType: 'send-email',
                    to: '{{student.parentEmail}}',
                    subject: `Thông báo vắng học - ${schedule.className}`,
                    body: `Kính gửi Quý Phụ huynh,

Con của Quý vị ({{student.name}}) đã vắng mặt trong buổi học:

📚 Môn: ${schedule.className}
📅 Ngày: {{date}}
⏰ Giờ: {{time}}

Vui lòng liên hệ nhà trường nếu có thắc mắc.

Trân trọng,
Hệ thống Edu-Flow`
                }
            }
        ],
        edges: [
            { id: 'e1', source: 'check-absent', target: 'get-student', sourceHandle: 'true' },
            { id: 'e2', source: 'get-student', target: 'send-notification' }
        ],
        isActive: false
    })
};

/**
 * Helper: Get template names and descriptions
 */
export const TEMPLATE_METADATA = {
    'attendance-link': {
        name: 'Auto Attendance Link',
        description: 'Tự động gửi link điểm danh 15 phút trước giờ học',
        icon: '📧',
        category: 'automation'
    },
    'teacher-reminder': {
        name: 'Teacher Reminder',
        description: 'Nhắc nhở giáo viên điểm danh',
        icon: '⏰',
        category: 'automation'
    },
    'weekly-report': {
        name: 'Weekly Report',
        description: 'Báo cáo điểm danh hàng tuần',
        icon: '📊',
        category: 'reporting'
    },
    'low-attendance-alert': {
        name: 'Low Attendance Alert',
        description: 'Cảnh báo khi điểm danh thấp < 80%',
        icon: '⚠️',
        category: 'alert'
    },
    'absence-notification': {
        name: 'Absence Notification',
        description: 'Thông báo phụ huynh khi vắng mặt',
        icon: '📲',
        category: 'alert'
    }
};

/**
 * Helper: Create workflow from template
 * Usage:
 * const workflow = createWorkflowFromTemplate('attendance-link', schedule);
 * await WorkflowService.create(workflow);
 */
export function createWorkflowFromTemplate(
    templateKey: keyof typeof SCHEDULE_WORKFLOW_TEMPLATES,
    scheduleData: any
): Partial<Workflow> {
    const templateFn = SCHEDULE_WORKFLOW_TEMPLATES[templateKey];
    if (!templateFn) {
        throw new Error(`Template "${templateKey}" not found`);
    }
    return templateFn(scheduleData);
}
