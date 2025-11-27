import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { WorkflowsService } from './workflows.service';
import { CronJob } from 'cron';

@Injectable()
export class WorkflowSchedulerService implements OnModuleInit {
    private readonly logger = new Logger(WorkflowSchedulerService.name);

    constructor(
        private workflowsService: WorkflowsService,
        private schedulerRegistry: SchedulerRegistry,
    ) { }

    async onModuleInit() {
        this.logger.log('Initializing Workflow Scheduler...');
        try {
            await this.loadScheduledWorkflows();
        } catch (error) {
            this.logger.error('Failed to load scheduled workflows', error);
        }
    }

    async loadScheduledWorkflows() {
        // Fetch all active workflows with a 'schedule' trigger
        // This assumes we have a way to query workflows by trigger type
        // For now, we might need to fetch all and filter, or add a query method
        const workflows = await this.workflowsService.findAll();
        const scheduledWorkflows = workflows.filter(
            (w) => w.isActive && w.trigger?.type === 'schedule' && w.trigger?.config?.cron,
        );

        this.logger.log(`Found ${scheduledWorkflows.length} scheduled workflows.`);

        scheduledWorkflows.forEach((workflow) => {
            this.scheduleWorkflow(workflow.id, workflow.trigger.config.cron);
        });
    }

    scheduleWorkflow(workflowId: string, cronExpression: string) {
        const jobName = `workflow_${workflowId}`;

        // Check if job already exists and delete it (for updates)
        if (this.schedulerRegistry.doesExist('cron', jobName)) {
            this.schedulerRegistry.deleteCronJob(jobName);
        }

        const job = new CronJob(cronExpression, () => {
            this.logger.log(`Executing scheduled workflow: ${workflowId}`);
            this.workflowsService.executeWorkflow(workflowId, 'scheduler');
        });

        this.schedulerRegistry.addCronJob(jobName, job);
        job.start();

        this.logger.log(
            `Scheduled workflow ${workflowId} with cron: ${cronExpression}`,
        );
    }

    // Optional: Global cron to check for one-time scheduled workflows if we support specific dates
    // @Cron(CronExpression.EVERY_MINUTE)
    // handleCron() {
    //   this.logger.debug('Checking for scheduled workflows...');
    // }
}
