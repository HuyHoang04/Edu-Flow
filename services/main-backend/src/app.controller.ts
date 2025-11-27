import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ClassesService } from './classes/classes.service';
import { StudentsService } from './students/students.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly classesService: ClassesService,
    private readonly studentsService: StudentsService,
  ) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('seed-data')
  async seedData() {
    console.log('🚀 Seeding Classes and Students via API...');

    console.log('🗑️ Clearing existing data...');
    // Use createQueryBuilder to bypass "empty criteria" check
    await this.studentsService.studentsRepository.createQueryBuilder().delete().execute();
    await this.classesService.classesRepository.createQueryBuilder().delete().execute();
    console.log('✅ Data cleared.');

    // 1. Create Classes
    const classesData = [
      { name: 'Software Engineering A', code: 'SE101-A', semester: 'Fall 2023', year: 2023, teacherId: 'system', subject: 'Software Engineering' },
      { name: 'Database Systems B', code: 'DB201-B', semester: 'Fall 2023', year: 2023, teacherId: 'system', subject: 'Database Systems' },
      { name: 'Artificial Intelligence C', code: 'AI301-C', semester: 'Spring 2024', year: 2024, teacherId: 'system', subject: 'Artificial Intelligence' },
    ];

    const createdClasses: any[] = [];
    for (const cls of classesData) {
      const newClass = await this.classesService.create(cls);
      createdClasses.push(newClass);
    }

    // 2. Create Students
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
            class: cls
          };

          try {
            await this.studentsService.create(studentData);
          } catch (e) {
            console.error(`Failed to create student ${name}`, e);
          }
        }
      }
    }

    return { message: 'Seeding complete!', classes: createdClasses.length, students: createdClasses.length * 5 };
  }
}
