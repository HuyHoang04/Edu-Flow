import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { EmailsService } from './emails.service';
import type { SendEmailDto } from './emails.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('emails')
@UseGuards(JwtAuthGuard)
export class EmailsController {
  constructor(private emailsService: EmailsService) { }

  @Get()
  async findAll(@Req() req: any) {
    return this.emailsService.findAll(req.user.id);
  }

  @Get('stats/:userId')
  async getStats(@Param('userId') userId: string) {
    return this.emailsService.getEmailStats(userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.emailsService.findById(id);
  }

  @Post('send')
  async sendEmail(@Body() emailData: SendEmailDto, @Req() req: any) {
    return this.emailsService.sendEmail({
      ...emailData,
      sentBy: req.user.id,
    });
  }

  @Post('send/bulk')
  async sendBulkEmail(@Body() emailData: SendEmailDto) {
    return this.emailsService.sendBulkEmail(emailData);
  }

  @Post('send/class/:classId')
  async sendToClass(
    @Param('classId') classId: string,
    @Body() data: { subject: string; body: string; sentBy: string },
  ) {
    return this.emailsService.sendToClass(
      classId,
      data.subject,
      data.body,
      data.sentBy,
    );
  }
}
