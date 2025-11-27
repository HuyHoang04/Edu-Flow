
import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { ClassesService } from './src/classes/classes.service';
import { StudentsService } from './src/students/students.service';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const classesService = app.get(ClassesService);
    const studentsService = app.get(StudentsService);

    console.log('🚀 Seeding Classes and Students...');

    console.log('🗑️ Clearing existing data...');
    // Delete all students first (FK constraint)
    await studentsService.studentsRepository.delete({});
    // Delete all classes
    await classesService.classesRepository.delete({});
    console.log('✅ Data cleared.');

    // 1. Create Classes
    const classesData = [
        { name: 'Software Engineering A', code: 'SE101-A', semester: 'Fall 2023', year: 2023, teacherId: 'system', subject: 'Software Engineering' },
        { name: 'Database Systems B', code: 'DB201-B', semester: 'Fall 2023', year: 2023, teacherId: 'system', subject: 'Database Systems' },
        { name: 'Artificial Intelligence C', code: 'AI301-C', semester: 'Spring 2024', year: 2024, teacherId: 'system', subject: 'Artificial Intelligence' },
    ];

    const createdClasses: any[] = [];
    for (const cls of classesData) {
        const newClass = await classesService.create(cls);
        createdClasses.push(newClass);
        console.log(`✅ Created Class: ${newClass.name}`);
    }

    // 2. Create Students for each class
    if (createdClasses.length > 0) {
        const studentNames = [
            ['Nguyen Van A', 'Tran Thi B', 'Le Van C', 'Pham Thi D', 'Hoang Van E'],
            ['Do Thi F', 'Ngo Van G', 'Vu Thi H', 'Dang Van I', 'Bui Thi K'],
            ['Ly Van L', 'Truong Thi M', 'Dinh Van N', 'Vo Thi O', 'Bach Van P']
        ];

        for (let i = 0; i < createdClasses.length; i++) {
            const cls = createdClasses[i];
            const names = studentNames[i] || [];

            for (let j = 0; j < names.length; j++) {
                const name = names[j];
                const code = `SV${j + 1}${Date.now().toString().slice(-4)}`;
                const email = `student${j + 1}${Date.now().toString().slice(-4)}@example.com`;

                const studentData = {
                    name,
                    code,
                    email,
                    phone: '0123456789',
                    class: cls // Set relation directly
                };

                try {
                    await studentsService.create(studentData);
                    console.log(`   👤 Created Student: ${name} in ${cls.name}`);
                } catch (e) {
                    console.log(`   ❌ Failed to create student ${name}:`, e);
                }
            }
        }
    }

    console.log('✨ Seeding complete!');
    await app.close();
    process.exit(0);
}

bootstrap();
