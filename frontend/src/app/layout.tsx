import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Teacher Automation System",
    description: "Hệ thống tự động hóa công việc giáo viên",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="vi" className="dark">
            <body className={inter.className}>{children}</body>
        </html>
    );
}
