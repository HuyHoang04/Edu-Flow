import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Query,
    UseGuards,
} from '@nestjs/common';
import { EmailsService } from './emails.service';
import type { SendEmailDto } from './emails.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('emails')
@UseGuards(JwtAuthGuard)
export class EmailsController {
    constructor(private emailsService: EmailsService) { }

    @Get()
    async findAll(@Query('sentBy') sentBy?: string) {
        return this.emailsService.findAll(sentBy);
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
    async sendEmail(@Body() emailData: SendEmailDto) {
        return this.emailsService.sendEmail(emailData);
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
