import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Class } from './class.entity';
import { ClassesService } from './classes.service';
import { ClassesController } from './classes.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Class])],
    controllers: [ClassesController],
    providers: [ClassesService],
    exports: [ClassesService],
})
export class ClassesModule { }
