"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LectureService } from "@/services/lecture.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft, Wand2 } from "lucide-react";
import { toast } from "sonner";

export default function CreateLecturePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        topic: "",
        audience: "University Students",
        duration_minutes: 45,
        detail_level: "Detailed"
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.topic) return;

        setLoading(true);
        try {
            const lecture = await LectureService.generate(formData);
            toast.success("Lecture generated successfully!");
            router.push("/dashboard/lectures"); // Or redirect to detail view
        } catch (error) {
            toast.error("Failed to generate lecture");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-2xl font-bold">Create New Lecture</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>AI Lecture Generator</CardTitle>
                    <CardDescription>
                        Enter a topic and let AI generate a complete lecture outline and slides for you.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="topic">Topic</Label>
                            <Textarea
                                id="topic"
                                placeholder="e.g., Introduction to Quantum Physics, History of the Roman Empire..."
                                value={formData.topic}
                                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                                required
                                className="min-h-[100px]"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="audience">Target Audience</Label>
                                <Input
                                    id="audience"
                                    value={formData.audience}
                                    onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="duration">Duration (minutes)</Label>
                                <Input
                                    id="duration"
                                    type="number"
                                    value={formData.duration_minutes}
                                    onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="detail">Detail Level</Label>
                            <Select
                                value={formData.detail_level}
                                onValueChange={(value) => setFormData({ ...formData, detail_level: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select detail level" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Brief">Brief (Overview)</SelectItem>
                                    <SelectItem value="Standard">Standard</SelectItem>
                                    <SelectItem value="Detailed">Detailed (In-depth)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Generating Content...
                                </>
                            ) : (
                                <>
                                    <Wand2 className="mr-2 h-4 w-4" />
                                    Generate Lecture
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
