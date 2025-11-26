import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Form } from './form.entity';
import { FormResponse } from './form-response.entity';
import { FormsService } from './forms.service';
import { FormsController } from './forms.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Form, FormResponse])],
    controllers: [FormsController],
    providers: [FormsService],
    exports: [FormsService],
})
export class FormsModule { }
