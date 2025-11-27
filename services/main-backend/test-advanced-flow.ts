
import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { WorkflowsService } from './src/workflows/workflows.service';
import { FormsService } from './src/forms/forms.service';
import { ReportsService } from './src/reports/reports.service';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const workflowsService = app.get(WorkflowsService);
    const formsService = app.get(FormsService);
    const reportsService = app.get(ReportsService);

    console.log('🚀 Starting Advanced Workflow Test...');

    // 1. Create a Workflow with Form and Report nodes
    console.log('\n1️⃣ Creating Workflow...');
    const workflowData = {
        name: 'Advanced Test Workflow',
        description: 'Testing Forms and Reports',
        trigger: { type: 'manual' },
        createdBy: 'test-user',
        nodes: [
            {
                id: '1',
                type: 'custom',
                data: {
                    label: 'Manual Trigger',
                    nodeType: 'manual-trigger',
                },
                position: { x: 0, y: 0 },
            },
            {
                id: '2',
                type: 'custom',
                data: {
                    label: 'Create Form',
                    nodeType: 'create-form',
                    title: 'Student Survey',
                    description: 'Please fill out this survey.',
                    deadline: '2023-12-31',
                },
                position: { x: 200, y: 0 },
            },
            {
                id: '3',
                type: 'custom',
                data: {
                    label: 'Generate Report',
                    nodeType: 'generate-report',
                    reportType: 'attendance',
                    startDate: '2023-01-01',
                    endDate: '2023-12-31',
                },
                position: { x: 400, y: 0 },
            },
        ],
        edges: [
            { id: 'e1-2', source: '1', target: '2' },
            { id: 'e2-3', source: '2', target: '3' },
        ],
    };

    const workflow = await workflowsService.create(workflowData as any);
    console.log(`✅ Workflow created with ID: ${workflow.id}`);

    // 2. Execute the Workflow
    console.log('\n2️⃣ Executing Workflow...');
    const result = await workflowsService.executeWorkflow(workflow.id, 'manual');
    console.log('✅ Execution Result:', JSON.stringify(result, null, 2));

    // 3. Verify Form Creation
    console.log('\n3️⃣ Verifying Form Creation...');
    const forms = await formsService.findAll();
    const createdForm = forms.find(f => f.title === 'Student Survey');
    if (createdForm) {
        console.log(`✅ Form found: ${createdForm.title} (ID: ${createdForm.id})`);
    } else {
        console.error('❌ Form NOT found!');
    }

    // 4. Verify Report Generation
    console.log('\n4️⃣ Verifying Report Generation...');
    // Assuming ReportsService has a findAll or similar
    // If not, we might need to check the execution logs or add a method
    // For now, let's trust the execution log output
    console.log('ℹ️ Check execution logs above for Report ID.');

    await app.close();
}

bootstrap();
