import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";

const beVietnamPro = Be_Vietnam_Pro({
    subsets: ["latin", "vietnamese"],
    weight: ["300", "400", "500", "600", "700"],
    display: "swap",
});

export const metadata: Metadata = {
    title: "Education Automation Hub (EAH)",
    description: "Hệ thống tự động hóa giáo dục toàn diện",
};

import { Providers } from "@/components/providers/Providers";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="vi" suppressHydrationWarning>
            <body className={beVietnamPro.className}>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
