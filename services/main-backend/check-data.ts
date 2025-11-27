
import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { ClassesService } from './src/classes/classes.service';
import { StudentsService } from './src/students/students.service';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const classesService = app.get(ClassesService);
    const studentsService = app.get(StudentsService);

    console.log('🔍 Checking Data...');

    const classes = await classesService.findAll();
    console.log(`Found ${classes.length} classes.`);

    for (const cls of classes) {
        console.log(`Class: ${cls.name} (ID: ${cls.id})`);
        // Check student count property
        console.log(`  - studentCount property: ${(cls as any).studentCount}`);

        // Check actual students via service
        const students = await studentsService.findAll(cls.id);
        console.log(`  - Actual students found via StudentsService: ${students.length}`);

        // Check students via relation if loaded
        if (cls.students) {
            console.log(`  - Students loaded in class entity: ${cls.students.length}`);
        } else {
            console.log(`  - Students relation NOT loaded in class entity`);
        }
    }

    const allStudents = await studentsService.findAll();
    console.log(`Total students in DB: ${allStudents.length}`);
    if (allStudents.length > 0) {
        console.log('Sample Student 1:', {
            name: allStudents[0].name,
            classId: allStudents[0].classId,
            class: allStudents[0].class
        });
        if (allStudents.length > 1) {
            console.log('Sample Student 2:', {
                name: allStudents[1].name,
                classId: allStudents[1].classId,
                class: allStudents[1].class
            });
        }
    }

    await app.close();
}

bootstrap();
