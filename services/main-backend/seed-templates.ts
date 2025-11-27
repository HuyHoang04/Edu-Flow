
import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { WorkflowsService } from './src/workflows/workflows.service';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const workflowsService = app.get(WorkflowsService);

    console.log('🚀 Seeding Default Templates...');

    const templates = [
        {
            name: 'Weekly Quiz Automation',
            description: 'Automatically create a quiz every week and assign it to a class.',
            category: 'Education',
            createdBy: 'system',
            trigger: {
                type: 'schedule',
                config: { cron: '0 9 * * 1' } // Every Monday at 9 AM
            },
            nodes: [
                {
                    id: '1',
                    type: 'custom',
                    data: { label: 'Weekly Schedule', nodeType: 'manual-trigger' }, // Using manual for template, but config implies schedule
                    position: { x: 0, y: 0 }
                },
                {
                    id: '2',
                    type: 'custom',
                    data: {
                        label: 'Create Quiz',
                        nodeType: 'create-exam',
                        title: 'Weekly Quiz',
                        duration: 30,
                        questionCount: 10,
                        topic: 'General',
                        difficulty: 'medium'
                    },
                    position: { x: 250, y: 0 }
                },
                {
                    id: '3',
                    type: 'custom',
                    data: {
                        label: 'Notify Students',
                        nodeType: 'send-email',
                        subject: 'New Quiz Available',
                        content: 'A new weekly quiz has been created. Please complete it by Friday.'
                    },
                    position: { x: 500, y: 0 }
                }
            ],
            edges: [
                { id: 'e1-2', source: '1', target: '2' },
                { id: 'e2-3', source: '2', target: '3' }
            ]
        },
        {
            name: 'Attendance Report',
            description: 'Generate a monthly attendance report and email it to the teacher.',
            category: 'Reporting',
            createdBy: 'system',
            trigger: { type: 'manual' },
            nodes: [
                {
                    id: '1',
                    type: 'custom',
                    data: { label: 'Start', nodeType: 'manual-trigger' },
                    position: { x: 0, y: 0 }
                },
                {
                    id: '2',
                    type: 'custom',
                    data: {
                        label: 'Generate Report',
                        nodeType: 'generate-report',
                        reportType: 'attendance',
                        startDate: '{{lastMonthStart}}',
                        endDate: '{{lastMonthEnd}}'
                    },
                    position: { x: 250, y: 0 }
                },
                {
                    id: '3',
                    type: 'custom',
                    data: {
                        label: 'Email Report',
                        nodeType: 'send-email',
                        subject: 'Monthly Attendance Report',
                        content: 'Attached is the attendance report for last month.'
                    },
                    position: { x: 500, y: 0 }
                }
            ],
            edges: [
                { id: 'e1-2', source: '1', target: '2' },
                { id: 'e2-3', source: '2', target: '3' }
            ]
        },
        {
            name: 'Student Feedback Survey',
            description: 'Send a feedback form to students after a course ends.',
            category: 'Feedback',
            createdBy: 'system',
            trigger: { type: 'manual' },
            nodes: [
                {
                    id: '1',
                    type: 'custom',
                    data: { label: 'Course End', nodeType: 'manual-trigger' },
                    position: { x: 0, y: 0 }
                },
                {
                    id: '2',
                    type: 'custom',
                    data: {
                        label: 'Create Survey',
                        nodeType: 'create-form',
                        title: 'Course Feedback',
                        description: 'Please let us know how we did.',
                        deadline: '2023-12-31'
                    },
                    position: { x: 250, y: 0 }
                },
                {
                    id: '3',
                    type: 'custom',
                    data: {
                        label: 'Send Link',
                        nodeType: 'send-email',
                        subject: 'Feedback Request',
                        content: 'Please fill out this survey: {{formUrl}}'
                    },
                    position: { x: 500, y: 0 }
                }
            ],
            edges: [
                { id: 'e1-2', source: '1', target: '2' },
                { id: 'e2-3', source: '2', target: '3' }
            ]
        }
    ];

    for (const tmpl of templates) {
        // Check if template exists to avoid duplicates
        const existing = await workflowsService.findAllTemplates();
        const found = existing.find(t => t.name === tmpl.name);

        if (!found) {
            // We need to manually create it as a template because saveAsTemplate expects an existing workflow ID
            // Or we can use the repository directly if we had access, but WorkflowsService doesn't expose createTemplate directly.
            // However, WorkflowsService.create creates a workflow. We can create it then update it to be a template.

            // Actually, let's just use the repository via a hack or add a method. 
            // But wait, WorkflowsService.create takes CreateWorkflowDto.
            // Let's create it as a workflow first, then mark as template.

            const workflow = await workflowsService.create(tmpl as any);
            await workflowsService.update(workflow.id, {
                isTemplate: true,
                category: tmpl.category
            });
            console.log(`✅ Created template: ${tmpl.name}`);
        } else {
            console.log(`ℹ️ Template already exists: ${tmpl.name}`);
        }
    }

    console.log('✨ Seeding complete!');
    await app.close();
}

bootstrap();
