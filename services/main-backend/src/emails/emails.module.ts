import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Email } from './email.entity';
import { EmailsService } from './emails.service';
import { EmailsController } from './emails.controller';
import { MailerService } from './mailer.service';

@Module({
    imports: [TypeOrmModule.forFeature([Email])],
    controllers: [EmailsController],
    providers: [EmailsService, MailerService],
    exports: [EmailsService, MailerService],
})
export class EmailsModule { }
