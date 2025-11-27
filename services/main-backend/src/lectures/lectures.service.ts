import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lecture } from './lecture.entity';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import PptxGenJS from 'pptxgenjs';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LecturesService {
  constructor(
    @InjectRepository(Lecture)
    private lecturesRepository: Repository<Lecture>,
    private configService: ConfigService,
  ) {}

  async findAll(): Promise<Lecture[]> {
    return this.lecturesRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findById(id: string): Promise<Lecture | null> {
    return this.lecturesRepository.findOne({ where: { id } });
  }

  async generateLecture(topic: string, options: any): Promise<Lecture> {
    const aiServiceUrl =
      this.configService.get('AI_SERVICE_URL') || 'http://localhost:8000';

    try {
      const response = await axios.post(`${aiServiceUrl}/lectures/generate`, {
        topic,
        ...options,
      });

      const data = response.data;

      const lecture = this.lecturesRepository.create({
        topic,
        title: data.title,
        outline: data.outline,
        slides: data.slides,
        createdBy: 'system', // Replace with actual user ID if available
      });

      return this.lecturesRepository.save(lecture);
    } catch (error) {
      console.error('Failed to generate lecture:', error);
      throw new Error('Failed to generate lecture');
    }
  }

  async exportPptx(id: string): Promise<string> {
    const lecture = await this.findById(id);
    if (!lecture) throw new Error('Lecture not found');

    const pres = new PptxGenJS();
    pres.layout = 'LAYOUT_16x9';

    // Title Slide
    const slide1 = pres.addSlide();
    slide1.addText(lecture.title, {
      x: 1,
      y: 1,
      w: '80%',
      h: 1,
      fontSize: 36,
      align: 'center',
    });
    slide1.addText(`Topic: ${lecture.topic}`, {
      x: 1,
      y: 2.5,
      w: '80%',
      h: 1,
      fontSize: 18,
      align: 'center',
    });

    // Content Slides
    lecture.slides.forEach((slideContent: any) => {
      const slide = pres.addSlide();
      slide.addText(slideContent.title, {
        x: 0.5,
        y: 0.5,
        w: '90%',
        h: 1,
        fontSize: 24,
        bold: true,
        color: '363636',
      });

      if (slideContent.bullets && Array.isArray(slideContent.bullets)) {
        const bullets = slideContent.bullets.map((b: string) => ({
          text: b,
          options: { fontSize: 18, bullet: true, breakLine: true },
        }));
        slide.addText(bullets, { x: 0.5, y: 1.5, w: '90%', h: 4 });
      }

      if (slideContent.speaker_notes) {
        slide.addNotes(slideContent.speaker_notes);
      }
    });

    const fileName = `lecture_${lecture.id}.pptx`;
    const uploadDir = path.join(process.cwd(), 'uploads', 'lectures');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const filePath = path.join(uploadDir, fileName);

    await pres.writeFile({ fileName: filePath });

    // Update URL in DB (assuming static file serving is set up or just returning path for now)
    // In a real app, upload to Cloudinary/S3. Here we'll return a local path/url.
    lecture.pptxUrl = `/uploads/lectures/${fileName}`;
    await this.lecturesRepository.save(lecture);

    return filePath;
  }
}
