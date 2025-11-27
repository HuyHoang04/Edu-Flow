import { Injectable } from '@nestjs/common';
import { NodeExecutor } from './node-executor.interface';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AIGenerateExecutor implements NodeExecutor {
    constructor(private configService: ConfigService) { }

    async execute(node: any, context: any): Promise<any> {
        const aiServiceUrl = this.configService.get('AI_SERVICE_URL') || 'http://localhost:8000';
        const { prompt, maxTokens = 500, temperature = 0.7, outputKey = 'aiGeneratedText' } = node.data;

        try {
            // Replace context variables in prompt (e.g., {{studentName}})
            const processedPrompt = this.replaceContextVariables(prompt, context);

            const response = await axios.post(`${aiServiceUrl}/generate`, {
                prompt: processedPrompt,
                max_tokens: maxTokens,
                temperature: temperature
            });

            // Store result in context
            context[outputKey] = response.data.text;
            context[`${outputKey}_tokensUsed`] = response.data.tokens_used;

            console.log(`[AIGenerateExecutor] Generated text (${response.data.tokens_used} tokens)`);

            return {
                success: true,
                nextNodes: node.data.nextNodes || [],
                context
            };
        } catch (error: any) {
            console.error('[AIGenerateExecutor] Error:', error.message);
            return {
                success: false,
                error: error.message,
                nextNodes: [],
                context
            };
        }
    }

    private replaceContextVariables(text: string, context: any): string {
        return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
            return context[key] !== undefined ? context[key] : match;
        });
    }
}
