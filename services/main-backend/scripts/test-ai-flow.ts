import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { WorkflowsService } from '../src/workflows/workflows.service';

const TEST_CASES = [
    {
        name: "Simple Email Notification",
        prompt: "Send an email to student@test.com when the workflow starts manually."
    },
    {
        name: "Exam Submission Grading",
        prompt: "When a student submits an exam, use AI to grade it, then email the result to the student."
    },
    {
        name: "Attendance Warning",
        prompt: "Every day at 8am, check for students with low attendance. If attendance < 50%, send a warning email."
    },
    {
        name: "Class Schedule Notification",
        prompt: "15 minutes before class starts, send a notification to all students in the class."
    },
    {
        name: "Complex Report Generation",
        prompt: "Manually trigger a report generation for exam results. If the report is successfully generated, email it to the teacher. Otherwise, log an error."
    }
];

// Mock available nodes (similar to what frontend would send)
const AVAILABLE_NODES = [
    { type: 'manual-trigger', category: 'Trigger', description: 'Starts manually', fields: [] },
    { type: 'schedule-trigger', category: 'Trigger', description: 'Starts on schedule', fields: [{ name: 'cron', type: 'text' }] },
    { type: 'exam-submission-trigger', category: 'Trigger', description: 'On exam submission', fields: [{ name: 'examId', type: 'select' }] },
    { type: 'class-schedule-trigger', category: 'Trigger', description: 'On class schedule', fields: [{ name: 'classId', type: 'select' }] },
    { type: 'send-email', category: 'Action', description: 'Sends email', fields: [{ name: 'to', type: 'text' }, { name: 'subject', type: 'text' }, { name: 'body', type: 'textarea' }] },
    { type: 'ai-grade', category: 'AI', description: 'AI Grading', fields: [{ name: 'submission', type: 'textarea' }] },
    { type: 'condition', category: 'Logic', description: 'If/Else', fields: [{ name: 'variable', type: 'text' }, { name: 'operator', type: 'select' }, { name: 'value', type: 'text' }] },
    { type: 'report', category: 'Action', description: 'Generate Report', fields: [{ name: 'reportType', type: 'select', options: ['ATTENDANCE', 'EXAM_RESULTS', 'CLASS_PERFORMANCE', 'STUDENT_PROGRESS'] }] },
    { type: 'send-notification', category: 'Action', description: 'Send Notification', fields: [{ name: 'message', type: 'text' }] }
];

async function runTests() {
    console.log("Starting AI Workflow Generation Tests (Direct Service Call)...\n");

    const app = await NestFactory.createApplicationContext(AppModule);
    const workflowsService = app.get(WorkflowsService);

    let passed = 0;
    let failed = 0;

    for (const testCase of TEST_CASES) {
        console.log(`Testing: ${testCase.name}`);
        console.log(`Prompt: "${testCase.prompt}"`);

        try {
            const data = await workflowsService.generateFromPrompt(
                testCase.prompt,
                AVAILABLE_NODES
            );

            // Validation
            if (!data.nodes || !Array.isArray(data.nodes)) throw new Error("Missing 'nodes' array");
            if (!data.edges || !Array.isArray(data.edges)) throw new Error("Missing 'edges' array");
            if (data.nodes.length === 0) throw new Error("Generated 0 nodes");

            // Check node structure
            data.nodes.forEach((node: any, index: number) => {
                if (node.type !== 'custom') throw new Error(`Node ${index} type is not 'custom'`);
                if (!node.data || !node.data.nodeType) throw new Error(`Node ${index} missing 'data.nodeType'`);
                if (!node.data.category) throw new Error(`Node ${index} missing 'data.category'`);
            });

            // Check edge structure
            data.edges.forEach((edge: any, index: number) => {
                if (!edge.source || !edge.target) throw new Error(`Edge ${index} missing source/target`);
            });

            console.log(`✅ PASS - Generated ${data.nodes.length} nodes, ${data.edges.length} edges.`);
            passed++;
        } catch (error: any) {
            console.error(`❌ FAIL - ${error.message}`);
            failed++;
        }
        console.log("-".repeat(50));
    }

    console.log(`\nTest Summary: ${passed} Passed, ${failed} Failed`);
    await app.close();
}

runTests();
