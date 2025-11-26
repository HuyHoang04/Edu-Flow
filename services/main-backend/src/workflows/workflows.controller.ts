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
    async create(@Body() workflowData: CreateWorkflowDto) {
        return this.workflowsService.create(workflowData);
    }

    @Post(':id/execute')
    async execute(
        @Param('id') workflowId: string,
        @Body() data: { triggeredBy: string; context?: Record<string, any> },
    ) {
        return this.workflowsService.executeWorkflow(
            workflowId,
            data.triggeredBy,
            data.context || {},
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
    async getExecution(@Param('id') id: string) {
        return this.workflowsService.getExecutionById(id);
    }

    @Post('executions/:id/cancel')
    async cancelExecution(@Param('id') id: string) {
        return this.workflowsService.cancelExecution(id);
    }
}
