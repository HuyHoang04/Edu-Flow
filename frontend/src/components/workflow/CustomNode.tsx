"use client";

import { memo, useEffect, useState } from "react";
import { Handle, Position, NodeProps, useReactFlow } from "@xyflow/react";
import { NODE_REGISTRY } from "./nodeRegistry";
import { WorkflowNode, NodeData } from "@/types/workflow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ClassService } from "@/services/class.service";
import { ExamService } from "@/services/exam.service";
import { StudentService } from "@/services/student.service";
import { VariablePicker } from "./VariablePicker";

const CustomNode = ({ id, data, selected }: NodeProps) => {
    const { updateNodeData } = useReactFlow();
    const nodeData = data as NodeData;
    const nodeType = nodeData.nodeType;
    const definition = NODE_REGISTRY[nodeType];
    const [dynamicOptions, setDynamicOptions] = useState<Record<string, { label: string; value: string }[]>>({});

    useEffect(() => {
        const loadOptions = async () => {
            if (!definition) return;

            const newOptions: Record<string, { label: string; value: string }[]> = {};

            for (const field of definition.fields) {
                if (field.type === "select" && field.dynamicOptions) {
                    try {
                        let options: any[] = [];
                        if (field.dynamicOptions === "classes") {
                            options = await ClassService.getAll();
                            newOptions[field.name] = options.map((c: any) => ({ label: c.name, value: c.id }));
                        } else if (field.dynamicOptions === "exams") {
                            // Assuming we have a way to get all exams or filter by class if needed
                            // For now, fetching all exams might be heavy, but let's assume a simple getAll or similar
                            // If ExamService.getAll doesn't exist, we might need to fix it.
                            // Let's check ExamService first or assume it exists.
                            // If not, we'll fallback to empty.
                            try {
                                options = await ExamService.getAll(); // Verify this exists
                                newOptions[field.name] = options.map((e: any) => ({ label: e.title, value: e.id }));
                            } catch (e) {
                                console.warn("Failed to load exams", e);
                            }
                        } else if (field.dynamicOptions === "students") {
                            // Students usually need a classId context. 
                            // If we can't get it, maybe we fetch all? Or just skip for now.
                            // Let's skip global student fetch for now as it's too many.
                        }
                    } catch (error) {
                        console.error(`Failed to load options for ${field.name}`, error);
                    }
                }
            }
            setDynamicOptions(newOptions);
        };

        loadOptions();
    }, [definition]);

    if (!definition) {
        return (
            <div className="rounded-md border border-red-500 bg-red-50 p-2 text-xs text-red-500">
                Unknown Node Type: {nodeType}
            </div>
        );
    }

    const Icon = definition.icon;

    const handleChange = (name: string, value: any) => {
        updateNodeData(id, { [name]: value });
    };

    return (
        <Card className={`min-w-[250px] border-2 shadow-sm transition-all ${selected ? "border-primary ring-2 ring-primary/20" : "border-muted-foreground/20"}`}>
            {/* Inputs (Handles) */}
            {definition.inputs.map((input) => (
                <Handle
                    key={input.id}
                    type="target"
                    position={Position.Left}
                    id={input.id}
                    className="!h-3 !w-3 !bg-muted-foreground"
                    style={input.style}
                />
            ))}

            <CardHeader className="bg-muted/30 px-4 py-3">
                <div className="flex items-center gap-2">
                    <div className="rounded-md bg-background p-1.5 shadow-sm">
                        <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-sm font-medium leading-none">
                            {definition.label}
                        </CardTitle>
                        <p className="mt-1 text-[10px] text-muted-foreground line-clamp-1">
                            {definition.description}
                        </p>
                    </div>
                </div>
            </CardHeader>

            {definition.fields.length > 0 && (
                <CardContent className="space-y-3 p-3">
                    {definition.fields.map((field) => (
                        <div key={field.name} className="space-y-1">
                            <Label className="text-[10px] uppercase text-muted-foreground">
                                {field.label}
                            </Label>
                            {field.type === "select" ? (
                                <Select
                                    value={nodeData[field.name] as string}
                                    onValueChange={(value: string) => handleChange(field.name, value)}
                                >
                                    <SelectTrigger className="h-8 text-xs">
                                        <SelectValue placeholder="Select..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(field.dynamicOptions ? dynamicOptions[field.name] : field.options)?.map((opt) => (
                                            <SelectItem key={opt.value} value={opt.value} className="text-xs">
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) : field.type === "textarea" ? (
                                <div className="relative">
                                    <Textarea
                                        placeholder={field.placeholder}
                                        className="min-h-[60px] resize-none text-xs pr-8"
                                        value={nodeData[field.name] as string || ""}
                                        onChange={(e) => handleChange(field.name, e.target.value)}
                                    />
                                    <div className="absolute right-1 top-1">
                                        <VariablePicker
                                            currentNodeId={id}
                                            onSelect={(val) => handleChange(field.name, (nodeData[field.name] as string || "") + val)}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="relative flex items-center">
                                    <Input
                                        type={field.type}
                                        placeholder={field.placeholder}
                                        className="h-8 text-xs pr-8"
                                        value={nodeData[field.name] as string || ""}
                                        onChange={(e) => handleChange(field.name, e.target.value)}
                                    />
                                    {field.type === 'text' && (
                                        <div className="absolute right-1">
                                            <VariablePicker
                                                currentNodeId={id}
                                                onSelect={(val) => handleChange(field.name, (nodeData[field.name] as string || "") + val)}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </CardContent>
            )}

            {/* Outputs (Handles) */}
            {definition.outputs.map((output) => (
                <Handle
                    key={output.id}
                    type="source"
                    position={Position.Right}
                    id={output.id}
                    className="!h-3 !w-3 !bg-primary"
                    style={output.style}
                >
                    {output.label && (
                        <div className="absolute -right-1 top-1/2 -translate-y-1/2 translate-x-full px-2 text-[10px] font-medium text-muted-foreground pointer-events-none whitespace-nowrap">
                            {output.label}
                        </div>
                    )}
                </Handle>
            ))}
        </Card>
    );
};

export default memo(CustomNode);
