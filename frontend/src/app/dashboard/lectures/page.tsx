"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Lecture, LectureService } from "@/services/lecture.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, FileText, Download, Presentation } from "lucide-react";
import { toast } from "sonner";

export default function LecturesPage() {
    const router = useRouter();
    const [lectures, setLectures] = useState<Lecture[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadLectures();
    }, []);

    const loadLectures = async () => {
        try {
            const data = await LectureService.getAll();
            setLectures(data);
        } catch (error) {
            toast.error("Failed to load lectures");
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            toast.promise(LectureService.exportPptx(id), {
                loading: 'Generating PPTX...',
                success: 'Download started',
                error: 'Failed to export PPTX'
            });
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Lectures</h1>
                    <p className="text-muted-foreground">
                        Generate and manage your AI-powered lectures.
                    </p>
                </div>
                <Button onClick={() => router.push("/dashboard/lectures/create")}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Lecture
                </Button>
            </div>

            {loading ? (
                <div>Loading...</div>
            ) : lectures.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center animate-in fade-in-50">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <Presentation className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold">No lectures created</h3>
                    <p className="mb-4 mt-2 text-sm text-muted-foreground max-w-sm">
                        Get started by creating your first AI-generated lecture.
                    </p>
                    <Button onClick={() => router.push("/dashboard/lectures/create")}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Lecture
                    </Button>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {lectures.map((lecture) => (
                        <Card
                            key={lecture.id}
                            className="cursor-pointer hover:border-primary/50 transition-colors"
                            onClick={() => router.push(`/dashboard/lectures/${lecture.id}`)}
                        >
                            <CardHeader className="pb-2">
                                <CardTitle className="line-clamp-1">{lecture.title || lecture.topic}</CardTitle>
                                <CardDescription className="line-clamp-2">
                                    Topic: {lecture.topic}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between text-sm text-muted-foreground mt-4">
                                    <span>{new Date(lecture.createdAt).toLocaleDateString()}</span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={(e) => handleExport(lecture.id, e)}
                                    >
                                        <Download className="mr-2 h-3 w-3" />
                                        PPTX
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
