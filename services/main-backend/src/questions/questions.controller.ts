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
import { QuestionsService } from './questions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Question, QuestionType, QuestionDifficulty } from './question.entity';

@Controller('questions')
@UseGuards(JwtAuthGuard)
export class QuestionsController {
  constructor(private questionsService: QuestionsService) {}

  @Get()
  async findAll(
    @Query('subject') subject?: string,
    @Query('topic') topic?: string,
    @Query('difficulty') difficulty?: QuestionDifficulty,
    @Query('type') type?: QuestionType,
    @Query('createdBy') createdBy?: string,
  ) {
    return this.questionsService.findAll({
      subject,
      topic,
      difficulty,
      type,
      createdBy,
    });
  }

  @Get('search/tags')
  async searchByTags(@Query('tags') tags: string) {
    const tagArray = tags.split(',');
    return this.questionsService.searchByTags(tagArray);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.questionsService.findById(id);
  }

  @Post()
  async create(@Body() questionData: Partial<Question>, @Req() req: any) {
    return this.questionsService.create({
      ...questionData,
      createdBy: req.user.id,
    });
  }

  @Post('bulk')
  async bulkCreate(@Body() questionsData: Partial<Question>[]) {
    return this.questionsService.bulkCreate(questionsData);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() questionData: Partial<Question>,
  ) {
    return this.questionsService.update(id, questionData);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.questionsService.delete(id);
    return { message: 'Question deleted successfully' };
  }
}
