import {
    Play,
    Calendar,
    Mail,
    FileText,
    GitBranch,
    Repeat,
    Users,
    Database,
    Brain,
    Zap,
    Clock,
    MessageSquare,
    Webhook,
    GraduationCap,
    ClipboardCheck,
    UserCog,
    FileSpreadsheet,
    Search
} from "lucide-react";
import { NodeDefinition } from "@/types/workflow";

export const NODE_REGISTRY: Record<string, NodeDefinition> = {
    // --- TRIGGERS ---
    "manual-trigger": {
        type: "manual-trigger",
        label: "Manual Trigger",
        icon: Play,
        category: "Trigger",
        description: "Starts the workflow manually.",
        fields: [],
        inputs: [],
        outputs: [{ id: "out", type: "source", label: "Start" }],
    },
    "schedule-trigger": {
        type: "schedule-trigger",
        label: "Schedule",
        icon: Calendar,
        category: "Trigger",
        description: "Starts the workflow at a specific time.",
        fields: [
            { name: "cron", label: "Cron Expression", type: "text", placeholder: "0 8 * * *" },
            { name: "timezone", label: "Timezone", type: "select", options: [{ label: "UTC", value: "UTC" }, { label: "Vietnam (GMT+7)", value: "Asia/Ho_Chi_Minh" }] }
        ],
        inputs: [],
        outputs: [{ id: "out", type: "source", label: "Time" }],
    },
    "webhook-trigger": {
        type: "webhook-trigger",
        label: "Webhook",
        icon: Webhook,
        category: "Trigger",
        description: "Starts when an external request is received.",
        fields: [
            { name: "method", label: "Method", type: "select", options: [{ label: "POST", value: "POST" }, { label: "GET", value: "GET" }] },
            { name: "path", label: "Path", type: "text", placeholder: "/my-webhook" },
        ],
        inputs: [],
        outputs: [{ id: "out", type: "source", label: "Request" }],
    },

    // --- ACTIONS ---
    "send-email": {
        type: "send-email",
        label: "Send Email",
        icon: Mail,
        category: "Action",
        description: "Sends an email to a recipient.",
        fields: [
            { name: "to", label: "To", type: "text", placeholder: "email@example.com" },
            { name: "subject", label: "Subject", type: "text", placeholder: "Email Subject" },
            { name: "body", label: "Body", type: "textarea", placeholder: "Email content..." },
        ],
        inputs: [{ id: "in", type: "target", label: "In" }],
        outputs: [{ id: "out", type: "source", label: "Sent" }],
    },
    "create-form": {
        type: "create-form",
        label: "Create Form",
        icon: FileText,
        category: "Action",
        description: "Creates a dynamic form.",
        fields: [
            { name: "title", label: "Form Title", type: "text", placeholder: "Survey Title" },
            { name: "description", label: "Description", type: "textarea" },
            { name: "deadline", label: "Deadline", type: "date" },
            { name: "assignTo", label: "Assign To", type: "text", placeholder: "Student ID or Email" },
        ],
        inputs: [{ id: "in", type: "target", label: "In" }],
        outputs: [{ id: "out", type: "source", label: "Created" }, { id: "response", type: "source", label: "On Response" }],
        outputVariables: [
            { name: "createdFormId", label: "Form ID", description: "The ID of the created form" },
            { name: "formUrl", label: "Form URL", description: "The public URL of the form" }
        ]
    },
    "generate-report": {
        type: "generate-report",
        label: "Generate Report",
        icon: FileSpreadsheet,
        category: "Action",
        description: "Generates a report.",
        fields: [
            {
                name: "reportType", label: "Report Type", type: "select", options: [
                    { label: "Attendance", value: "attendance" },
                    { label: "Exam Results", value: "exam_results" },
                    { label: "Class Performance", value: "class_performance" },
                    { label: "Student Progress", value: "student_progress" }
                ]
            },
            { name: "classId", label: "Class", type: "select", dynamicOptions: "classes", placeholder: "Optional (for class reports)" },
            { name: "examId", label: "Exam", type: "select", dynamicOptions: "exams", placeholder: "Optional (for exam reports)" },
            { name: "studentId", label: "Student ID", type: "text", placeholder: "Optional (for student reports)" },
            { name: "startDate", label: "Start Date", type: "date" },
            { name: "endDate", label: "End Date", type: "date" },
        ],
        inputs: [{ id: "in", type: "target", label: "In" }],
        outputs: [{ id: "out", type: "source", label: "Generated" }],
        outputVariables: [
            { name: "reportId", label: "Report ID", description: "The ID of the generated report" }
        ]
    },
    "create-exam": {
        type: "create-exam",
        label: "Create Exam",
        icon: GraduationCap,
        category: "Action",
        description: "Creates a new exam.",
        fields: [
            { name: "title", label: "Exam Title", type: "text" },
            { name: "duration", label: "Duration (mins)", type: "number", defaultValue: 60 },
            { name: "questionBankId", label: "Question Bank ID", type: "text" },
        ],
        inputs: [{ id: "in", type: "target", label: "In" }],
        outputs: [{ id: "out", type: "source", label: "Created" }],
        outputVariables: [
            { name: "createdExamId", label: "Exam ID", description: "The ID of the created exam" },
            { name: "questionCount", label: "Question Count", description: "Number of questions in the exam" }
        ]
    },
    "assign-grade": {
        type: "assign-grade",
        label: "Assign Grade",
        icon: ClipboardCheck,
        category: "Action",
        description: "Assigns a grade to a student.",
        fields: [
            { name: "studentId", label: "Student ID", type: "text" },
            { name: "score", label: "Score", type: "number" },
            { name: "comments", label: "Comments", type: "textarea" },
        ],
        inputs: [{ id: "in", type: "target", label: "In" }],
        outputs: [{ id: "out", type: "source", label: "Assigned" }],
    },
    "update-student": {
        type: "update-student",
        label: "Update Student",
        icon: UserCog,
        category: "Action",
        description: "Updates student information.",
        fields: [
            { name: "studentId", label: "Student ID", type: "text" },
            { name: "field", label: "Field to Update", type: "select", options: [{ label: "Status", value: "status" }, { label: "Class", value: "class" }] },
            { name: "value", label: "New Value", type: "text" },
        ],
        inputs: [{ id: "in", type: "target", label: "In" }],
        outputs: [{ id: "out", type: "source", label: "Updated" }],
    },

    // --- LOGIC ---
    "condition": {
        type: "condition",
        label: "Condition (If/Else)",
        icon: GitBranch,
        category: "Logic",
        description: "Checks a condition.",
        fields: [
            { name: "variable", label: "Variable", type: "text" },
            { name: "operator", label: "Operator", type: "select", options: [{ label: "Equals", value: "eq" }, { label: "Contains", value: "contains" }, { label: "Greater Than", value: "gt" }] },
            { name: "value", label: "Value", type: "text" },
        ],
        inputs: [{ id: "in", type: "target", label: "In" }],
        outputs: [
            { id: "true", type: "source", label: "True", style: { top: "30%" } },
            { id: "false", type: "source", label: "False", style: { top: "70%" } }
        ],
    },
    "loop": {
        type: "loop",
        label: "Loop",
        icon: Repeat,
        category: "Logic",
        description: "Iterates over a list.",
        fields: [
            { name: "items", label: "Items to Loop", type: "text", placeholder: "Array variable" },
        ],
        inputs: [{ id: "in", type: "target", label: "In" }],
        outputs: [
            { id: "item", type: "source", label: "Each Item", style: { top: "30%" } },
            { id: "completed", type: "source", label: "Completed", style: { top: "70%" } }
        ],
    },
    "delay": {
        type: "delay",
        label: "Delay",
        icon: Clock,
        category: "Logic",
        description: "Pauses execution for a duration.",
        fields: [
            { name: "duration", label: "Duration (ms)", type: "number", defaultValue: 1000 },
        ],
        inputs: [{ id: "in", type: "target", label: "In" }],
        outputs: [{ id: "out", type: "source", label: "After Delay" }],
    },

    // --- DATA ---
    "get-students": {
        type: "get-students",
        label: "Get Students",
        icon: Users,
        category: "Data",
        description: "Fetches a list of students.",
        fields: [
            { name: "classId", label: "Class", type: "select", dynamicOptions: "classes" },
            { name: "status", label: "Status", type: "select", options: [{ label: "Active", value: "active" }, { label: "Inactive", value: "inactive" }, { label: "All", value: "all" }] },
        ],
        inputs: [{ id: "in", type: "target", label: "In" }],
        outputs: [{ id: "out", type: "source", label: "Students" }],
    },
    "get-classes": {
        type: "get-classes",
        label: "Get Classes",
        icon: Database,
        category: "Data",
        description: "Fetches a list of classes.",
        fields: [
            { name: "semester", label: "Semester", type: "text" },
        ],
        inputs: [{ id: "in", type: "target", label: "In" }],
        outputs: [{ id: "out", type: "source", label: "Classes" }],
    },
    "get-exam-results": {
        type: "get-exam-results",
        label: "Get Exam Results",
        icon: FileSpreadsheet,
        category: "Data",
        description: "Fetches results for an exam.",
        fields: [
            { name: "examId", label: "Exam", type: "select", dynamicOptions: "exams" },
        ],
        inputs: [{ id: "in", type: "target", label: "In" }],
        outputs: [{ id: "out", type: "source", label: "Results" }],
    },

    // --- AI ---
    "ai-generate": {
        type: "ai-generate",
        label: "AI Generate",
        icon: Brain,
        category: "AI",
        description: "Generates content using AI.",
        fields: [
            { name: "prompt", label: "Prompt", type: "textarea" },
            { name: "model", label: "Model", type: "select", options: [{ label: "Gemini Pro", value: "gemini-pro" }, { label: "GPT-4", value: "gpt-4" }] },
        ],
        inputs: [{ id: "in", type: "target", label: "In" }],
        outputs: [{ id: "out", type: "source", label: "Result" }],
        outputVariables: [
            { name: "aiGeneratedText", label: "Generated Text", description: "The content generated by AI" }
        ]
    },
    "ai-grade": {
        type: "ai-grade",
        label: "AI Grade",
        icon: GraduationCap,
        category: "AI",
        description: "AI grades a submission.",
        fields: [
            { name: "submission", label: "Submission Text", type: "textarea" },
            { name: "rubric", label: "Rubric", type: "textarea" },
        ],
        inputs: [{ id: "in", type: "target", label: "In" }],
        outputs: [{ id: "score", type: "source", label: "Score" }, { id: "feedback", type: "source", label: "Feedback" }],
        outputVariables: [
            { name: "gradeScore", label: "Score", description: "The grade score (0-100)" },
            { name: "gradeFeedback", label: "Feedback", description: "Detailed feedback from AI" }
        ]
    },
    "ai-summarize": {
        type: "ai-summarize",
        label: "AI Summarize",
        icon: MessageSquare,
        category: "AI",
        description: "Summarizes text content.",
        fields: [
            { name: "text", label: "Text to Summarize", type: "textarea" },
            { name: "length", label: "Length", type: "select", options: [{ label: "Short", value: "short" }, { label: "Medium", value: "medium" }, { label: "Long", value: "long" }] },
        ],
        inputs: [{ id: "in", type: "target", label: "In" }],
        outputs: [{ id: "summary", type: "source", label: "Summary" }],
    },

    // --- ATTENDANCE ---
    "create-attendance-session": {
        type: "create-attendance-session",
        label: "Create Attendance Code",
        icon: Clock,
        category: "Action",
        description: "Generates a unique check-in code.",
        fields: [
            { name: "classId", label: "Class", type: "select", dynamicOptions: "classes" },
            { name: "timeout", label: "Timeout (minutes)", type: "number", defaultValue: 5 },
        ],
        inputs: [{ id: "in", type: "target", label: "In" }],
        outputs: [{ id: "out", type: "source", label: "Created" }],
        outputVariables: [
            { name: "sessionCode", label: "Unique Code", description: "The 4-6 digit check-in code" },
            { name: "expiryTime", label: "Expiry Time", description: "When the code expires" },
            { name: "checkinUrl", label: "Check-in URL", description: "Direct link for students" }
        ]
    },
    "send-notification": {
        type: "send-notification",
        label: "Web Notification",
        icon: MessageSquare,
        category: "Action",
        description: "Sends a web notification.",
        fields: [
            { name: "recipientId", label: "Recipient ID", type: "text", placeholder: "User ID or {{teacherId}}" },
            { name: "title", label: "Title", type: "text" },
            { name: "message", label: "Message", type: "textarea" },
            { name: "type", label: "Type", type: "select", options: [{ label: "Info", value: "info" }, { label: "Success", value: "success" }, { label: "Warning", value: "warning" }] }
        ],
        inputs: [{ id: "in", type: "target", label: "In" }],
        outputs: [{ id: "out", type: "source", label: "Sent" }],
    },
};

export const NODE_CATEGORIES = [
    { label: "Triggers", value: "Trigger", icon: Zap },
    { label: "Actions", value: "Action", icon: Zap },
    { label: "Logic", value: "Logic", icon: GitBranch },
    { label: "Data", value: "Data", icon: Database },
    { label: "AI", value: "AI", icon: Brain },
];
