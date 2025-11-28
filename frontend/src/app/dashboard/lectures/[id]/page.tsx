'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { LectureService, Lecture } from '@/services/lecture.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Download, FileText, Presentation } from 'lucide-react';
import { toast } from 'sonner';

export default function LectureDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [lecture, setLecture] = useState<Lecture | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLecture = async () => {
            try {
                const data = await LectureService.getById(params.id as string);
                setLecture(data);
            } catch (error) {
                console.error('Failed to fetch lecture:', error);
                toast.error('Failed to load lecture details');
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            fetchLecture();
        }
    }, [params.id]);

    const handleExportPptx = async () => {
        if (!lecture) return;
        try {
            toast.promise(LectureService.exportPptx(lecture.id), {
                loading: 'Exporting PPTX...',
                success: 'PPTX exported successfully',
                error: 'Failed to export PPTX',
            });
        } catch (error) {
            console.error(error);
        }
    };

    const handleExportDocx = async () => {
        if (!lecture) return;
        try {
            toast.promise(LectureService.exportDocx(lecture), {
                loading: 'Exporting DOCX...',
                success: 'DOCX exported successfully',
                error: 'Failed to export DOCX',
            });
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!lecture) {
        return (
            <div className="p-8 text-center">
                <h1 className="text-2xl font-bold mb-4">Lecture not found</h1>
                <Button onClick={() => router.push('/dashboard/lectures')}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Lectures
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <Button
                        variant="ghost"
                        className="mb-4 pl-0 hover:pl-2 transition-all"
                        onClick={() => router.push('/dashboard/lectures')}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Lectures
                    </Button>
                    <h1 className="text-3xl font-bold tracking-tight">{lecture.title}</h1>
                    <p className="text-muted-foreground mt-2">
                        Topic: <span className="font-medium text-foreground">{lecture.topic}</span>
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleExportDocx}>
                        <FileText className="mr-2 h-4 w-4" /> Export DOCX
                    </Button>
                    <Button onClick={handleExportPptx}>
                        <Presentation className="mr-2 h-4 w-4" /> Export PPTX
                    </Button>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Outline Sidebar */}
                <Card className="lg:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle>Lecture Outline</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="list-disc list-inside space-y-2 text-sm">
                            {lecture.outline.map((item, index) => (
                                <li key={index} className="text-muted-foreground">
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>

                {/* Slides Content */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-2xl font-semibold">Slides Content</h2>
                    {lecture.slides.map((slide, index) => (
                        <Card key={index} className="overflow-hidden">
                            <CardHeader className="bg-muted/50 border-b">
                                <div className="flex justify-between items-center">
                                    <CardTitle className="text-lg">
                                        Slide {index + 1}: {slide.title}
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <div>
                                    <h4 className="font-medium mb-2 text-sm uppercase text-muted-foreground">Key Points</h4>
                                    <ul className="list-disc list-inside space-y-1">
                                        {slide.bullets.map((bullet: string, i: number) => (
                                            <li key={i}>{bullet}</li>
                                        ))}
                                    </ul>
                                </div>
                                {slide.speaker_notes && (
                                    <div className="bg-yellow-50/50 dark:bg-yellow-900/10 p-4 rounded-lg border border-yellow-200/50 dark:border-yellow-900/50">
                                        <h4 className="font-medium mb-1 text-sm text-yellow-800 dark:text-yellow-500">Speaker Notes</h4>
                                        <p className="text-sm text-muted-foreground italic">
                                            {slide.speaker_notes}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
