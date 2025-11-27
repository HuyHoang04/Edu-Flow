export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24">
            <div className="text-center">
                <h1 className="text-4xl font-bold mb-4">
                    Teacher Automation System
                </h1>
                <p className="text-xl text-muted-foreground mb-8">
                    Hệ thống tự động hóa công việc giáo viên
                </p>
                <div className="flex gap-4 justify-center">
                    <a
                        href="/login"
                        className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition"
                    >
                        Đăng nhập
                    </a>
                    <a
                        href="/dashboard"
                        className="px-6 py-3 border border-border rounded-lg hover:bg-muted transition"
                    >
                        Dashboard
                    </a>
                </div>
            </div>
        </main>
    );
}
