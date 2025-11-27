import { Injectable } from '@nestjs/common';
import { NodeExecutor } from './node-executor.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Class } from '../../classes/class.entity';

@Injectable()
export class GetClassesNodeExecutor implements NodeExecutor {
    constructor(
        @InjectRepository(Class)
        private classRepository: Repository<Class>
    ) { }

    async execute(node: any, context: any): Promise<any> {
        const { semester, outputKey = 'classes' } = node.data;

        console.log(`[GetClassesExecutor] Fetching classes (semester: ${semester || 'all'})`);

        try {
            let classes;

            if (semester) {
                classes = await this.classRepository.find({
                    where: { semester }
                });
            } else {
                classes = await this.classRepository.find();
            }

            context[outputKey] = classes;
            context[`${outputKey}_count`] = classes.length;

            console.log(`[GetClassesExecutor] Found ${classes.length} classes`);

            return {
                success: true,
                nextNodes: node.data.nextNodes || [],
                context
            };
        } catch (error: any) {
            console.error('[GetClassesExecutor] Error:', error.message);
            return {
                success: false,
                error: error.message,
                nextNodes: [],
                context
            };
        }
    }
}
