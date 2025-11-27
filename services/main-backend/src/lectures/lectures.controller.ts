import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { LecturesService } from './lectures.service';
import type { Response } from 'express';
import * as fs from 'fs';

@Controller('lectures')
export class LecturesController {
  constructor(private readonly lecturesService: LecturesService) { }

  @Get()
  async findAll() {
    return this.lecturesService.findAll();
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
  ) {
    return this.lecturesService.generateLecture(body.topic, body);
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
