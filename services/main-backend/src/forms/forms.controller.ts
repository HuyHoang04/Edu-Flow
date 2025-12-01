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
import { FormsService } from './forms.service';
import type { CreateFormDto, SubmitResponseDto } from './forms.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('forms')
export class FormsController {
  constructor(private formsService: FormsService) { }

  // Public endpoint for form viewing and submission
  @Get('public/:id')
  async getPublicForm(@Param('id') id: string) {
    return this.formsService.findById(id);
  }

  @Post('public/:id/submit')
  async submitPublicResponse(
    @Param('id') formId: string,
    @Body() responseData: Omit<SubmitResponseDto, 'formId'>,
  ) {
    return this.formsService.submitResponse({
      ...responseData,
      formId,
    });
  }

  // Protected endpoints
  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Req() req: any) {
    return this.formsService.findAll(req.user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string) {
    return this.formsService.findById(id);
  }

  @Get(':id/responses')
  @UseGuards(JwtAuthGuard)
  async getResponses(@Param('id') id: string) {
    return this.formsService.getFormResponses(id);
  }

  @Get(':id/stats')
  @UseGuards(JwtAuthGuard)
  async getStats(@Param('id') id: string) {
    return this.formsService.getFormStats(id);
  }

  @Get(':id/export')
  @UseGuards(JwtAuthGuard)
  async exportResponses(@Param('id') id: string) {
    return this.formsService.exportResponses(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() formData: CreateFormDto, @Req() req: any) {
    return this.formsService.create({
      ...formData,
      createdBy: req.user.id,
    });
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() formData: CreateFormDto) {
    return this.formsService.update(id, formData);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: string) {
    await this.formsService.delete(id);
    return { message: 'Form deleted successfully' };
  }
}
