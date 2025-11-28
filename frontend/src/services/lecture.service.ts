import { api } from "@/lib/api";

export interface Lecture {
    id: string;
    topic: string;
    title: string;
    outline: string[];
    slides: any[];
    pptxUrl?: string;
    docxUrl?: string;
    createdAt: string;
}

export const LectureService = {
    getAll: async () => {
        const response = await api.get<Lecture[]>('/lectures');
        return response.data;
    },

    getById: async (id: string) => {
        const response = await api.get<Lecture>(`/lectures/${id}`);
        return response.data;
    },

    generate: async (data: { topic: string; audience?: string; duration_minutes?: number; detail_level?: string }) => {
        const response = await api.post<Lecture>('/lectures/generate', data);
        return response.data;
    },

    exportPptx: async (id: string) => {
        // Trigger download
        const response = await api.post(`/lectures/${id}/export/pptx`, {}, { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `lecture_${id}.pptx`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    },

    exportDocx: async (lecture: Lecture) => {
        const { Document, Packer, Paragraph, TextRun, HeadingLevel } = await import('docx');
        const { saveAs } = await import('file-saver');

        const doc = new Document({
            sections: [{
                properties: {},
                children: [
                    new Paragraph({
                        text: lecture.title,
                        heading: HeadingLevel.TITLE,
                    }),
                    new Paragraph({
                        text: `Topic: ${lecture.topic}`,
                        heading: HeadingLevel.HEADING_2,
                    }),
                    new Paragraph({
                        text: "Outline",
                        heading: HeadingLevel.HEADING_1,
                    }),
                    ...lecture.outline.map(item => new Paragraph({
                        text: item,
                        bullet: { level: 0 }
                    })),
                    new Paragraph({
                        text: "Slides Content",
                        heading: HeadingLevel.HEADING_1,
                    }),
                    ...lecture.slides.flatMap((slide, index) => [
                        new Paragraph({
                            text: `Slide ${index + 1}: ${slide.title}`,
                            heading: HeadingLevel.HEADING_2,
                        }),
                        ...slide.bullets.map((bullet: string) => new Paragraph({
                            text: bullet,
                            bullet: { level: 0 }
                        })),
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: "Speaker Notes: ",
                                    bold: true,
                                }),
                                new TextRun(slide.speaker_notes || "No notes")
                            ]
                        }),
                        new Paragraph({ text: "" }) // Spacer
                    ])
                ],
            }],
        });

        const blob = await Packer.toBlob(doc);
        saveAs(blob, `${lecture.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.docx`);
    }
};
