import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Res,
  NotFoundException,
  UseGuards,
  Req,
} from '@nestjs/common';
import { LecturesService } from './lectures.service';
import type { Response } from 'express';
import * as fs from 'fs';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('lectures')
@UseGuards(JwtAuthGuard)
export class LecturesController {
  constructor(private readonly lecturesService: LecturesService) { }

  @Get()
  async findAll(@Req() req: any) {
    return this.lecturesService.findAll(req.user.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const lecture = await this.lecturesService.findById(id);
    if (!lecture) throw new NotFoundException('Lecture not found');
    return lecture;
  }

  @Post('generate')
  async generate(
    @Body()
    body: {
      topic: string;
      audience?: string;
      duration_minutes?: number;
      detail_level?: string;
    },
    @Req() req: any,
  ) {
    return this.lecturesService.generateLecture(body.topic, { ...body, createdBy: req.user.id });
  }

  @Post(':id/export/pptx')
  async exportPptx(@Param('id') id: string, @Res() res: Response) {
    try {
      const filePath = await this.lecturesService.exportPptx(id);
      if (fs.existsSync(filePath)) {
        res.download(filePath);
      } else {
        res.status(404).json({ message: 'File not generated' });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}
