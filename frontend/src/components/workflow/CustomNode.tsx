"use client";

import { memo, useEffect, useState } from "react";
import { Handle, Position, NodeProps, useReactFlow } from "@xyflow/react";
import { WorkflowNode, NodeData, NodeField, HandleDefinition } from "@/types/workflow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ClassService } from "@/services/class.service";
import { ExamService } from "@/services/exam.service";
import { StudentService } from "@/services/student.service";
import { VariablePicker } from "./VariablePicker";
import { useWorkflowConfig } from "./WorkflowConfigContext";
import {
    Play, Mail, GitBranch, Clock, Users, BookOpen, GraduationCap,
    FileText, Bell, Settings, Database, MessageSquare, Calendar
} from "lucide-react";

const ICON_MAP: Record<string, any> = {
    "manual-trigger": Play,
    "send-email": Mail,
    "condition": GitBranch,
    "delay": Clock,
    "get-students": Users,
    "get-classes": BookOpen,
    "get-exam-results": FileText,
    "create-exam": FileText,
    "assign-grade": GraduationCap,
    "update-student": Users,
    "create-attendance-session": Calendar,
    "send-notification": Bell,
    "ai-generate": MessageSquare,
    "loop": Settings,
};

const CustomNode = ({ id, data, selected }: NodeProps) => {
    const { updateNodeData } = useReactFlow();
    const { getNodeDefinition } = useWorkflowConfig();
    const nodeData = data as NodeData;
    const nodeType = nodeData.nodeType;

    // Resolve definition: Data > Context > Fallback
    const definition = nodeData.definition || getNodeDefinition(nodeType);

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
                            try {
                                options = await ExamService.getAll();
                                newOptions[field.name] = options.map((e: any) => ({ label: e.title, value: e.id }));
                            } catch (e) {
                                console.warn("Failed to load exams", e);
                            }
                        } else if (field.dynamicOptions === "students") {
                            // Skip for now
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

    // Resolve Icon
    let Icon = definition.icon;
    if (!Icon || typeof Icon === 'string') {
        Icon = ICON_MAP[nodeType] || Settings;
    }

    const handleChange = (name: string, value: any) => {
        updateNodeData(id, { [name]: value });
    };

    return (
        <Card className={`min-w-[250px] border-2 shadow-sm transition-all ${selected ? "border-primary ring-2 ring-primary/20" : "border-muted-foreground/20"}`}>
            {/* Inputs (Handles) */}
            {definition.inputs.map((input: HandleDefinition) => (
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
                    {definition.fields.map((field: NodeField) => (
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
                                        {(field.dynamicOptions ? dynamicOptions[field.name] : field.options)?.map((opt: { label: string; value: string }) => (
                                            <SelectItem key={opt.value} value={opt.value} className="text-xs">
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) : field.type === "textarea" || field.type === "json" ? (
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
            {definition.outputs.map((output: HandleDefinition) => (
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
