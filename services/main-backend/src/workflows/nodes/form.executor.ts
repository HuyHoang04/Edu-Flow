import { Injectable } from '@nestjs/common';
import { NodeExecutor } from './node-executor.interface';
import { FormsService } from '../../forms/forms.service';
import { FormFieldType } from '../../forms/form.entity';

@Injectable()
export class FormNodeExecutor implements NodeExecutor {
    constructor(private formsService: FormsService) { }

    async execute(node: any, context: any, execution: any, workflow?: any): Promise<any> {
        console.log(`[FormNode] Executing for node: ${node.id}`);

        const { title, description, fields, deadline, assignTo } = node.data;

        // Resolve variables in title/description if needed (handled by BaseNodeExecutor if we extended it, 
        // but here we might need to do it manually or extend BaseNodeExecutor. 
        // For simplicity, let's assume simple string or pre-resolved data for now, 
        // or we can implement simple replacement here).

        const resolvedTitle = this.resolveVariables(title || 'New Form', context);
        const resolvedDescription = this.resolveVariables(description || '', context);

        // Create the form
        const form = await this.formsService.create({
            title: resolvedTitle,
            description: resolvedDescription,
            fields: fields || [
                {
                    id: 'feedback',
                    type: FormFieldType.TEXT,
                    label: 'Your Feedback',
                    required: true
                }
            ],
            deadline: deadline ? new Date(deadline) : undefined,
            createdBy: context.userId || node.data.createdBy || 'system'
        });

        console.log(`[FormNode] Created form: ${form.id}`);

        const formUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/forms/${form.id}`;

        // Store in context
        context.createdFormId = form.id;
        context.formUrl = formUrl;
        context.form = form;

        return {
            success: true,
            output: {
                createdFormId: form.id,
                formUrl: formUrl,
                form: form
            }
        };
    }

    private resolveVariables(text: string, context: any): string {
        if (!text) return '';
        return text.replace(/\{\{([^}]+)\}\}/g, (match, variable) => {
            const keys = variable.trim().split('.');
            let value = context;
            for (const key of keys) {
                value = value ? value[key] : undefined;
            }
            return value !== undefined ? String(value) : match;
        });
    }
}
