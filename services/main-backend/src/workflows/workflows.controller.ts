import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    Req,
} from '@nestjs/common';
import { WorkflowsService } from './workflows.service';
import type { CreateWorkflowDto } from './workflows.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('workflows')
@UseGuards(JwtAuthGuard)
export class WorkflowsController {
    constructor(private workflowsService: WorkflowsService) { }

    @Get()
    async findAll(@Query('createdBy') createdBy?: string) {
        return this.workflowsService.findAll(createdBy);
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.workflowsService.findById(id);
    }

    @Get(':id/executions')
    async getExecutions(@Param('id') workflowId: string) {
        return this.workflowsService.getExecutions(workflowId);
    }

    @Post()
    async create(@Body() workflowData: CreateWorkflowDto, @Req() req: any) {
        console.log('Create Workflow Request:', { user: req.user, data: workflowData });
        return this.workflowsService.create({
            ...workflowData,
            createdBy: req.user?.id,
        });
    }

    @Post(':id/execute')
    async execute(
        @Param('id') workflowId: string,
        @Body() data: { triggeredBy: string; context?: Record<string, any> },
        @Req() req: any,
    ) {
        const context = data.context || {};
        if (req.user && req.user.id) {
            context.userId = req.user.id;
        }

        return this.workflowsService.executeWorkflow(
            workflowId,
            data.triggeredBy,
            context,
        );
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() workflowData: CreateWorkflowDto) {
        return this.workflowsService.update(id, workflowData);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        await this.workflowsService.delete(id);
        return { message: 'Workflow deleted successfully' };
    }

    // Execution management
    @Get('executions/all')
    async getAllExecutions() {
        return this.workflowsService.getExecutions();
    }

    @Get('executions/:id')
    async getExecution(@Param('id') executionId: string) {
        return this.workflowsService.getExecutionById(executionId);
    }

    @Post('executions/:id/cancel')
    async cancelExecution(@Param('id') id: string) {
        return this.workflowsService.cancelExecution(id);
    }

    // Template management
    @Get('templates/all')
    async getAllTemplates() {
        return this.workflowsService.findAllTemplates();
    }

    @Post(':id/save-as-template')
    async saveAsTemplate(
        @Param('id') id: string,
        @Body() data: { name?: string; description?: string; category?: string },
        @Req() req: any
    ) {
        return this.workflowsService.saveAsTemplate(id, {
            name: data.name,
            description: data.description,
            category: data.category,
            createdBy: req.user?.id
        });
    }

    @Post('templates/:id/use')
    async useTemplate(
        @Param('id') templateId: string,
        @Body() data: { name?: string },
        @Req() req: any
    ) {
        return this.workflowsService.useTemplate(templateId, {
            name: data.name,
            createdBy: req.user?.id
        });
    }
}
