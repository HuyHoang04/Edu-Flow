import Link from "next/link";
import { ArrowRight, CheckCircle2, Zap, Shield, BarChart3, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground">
            {/* Navigation */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-16 items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xl text-primary">
                        <img src="/logo.svg" alt="EAH Logo" className="h-10 w-auto" />
                        <span>EAH</span>
                    </div>
                    <nav className="hidden md:flex gap-6 text-sm font-medium text-muted-foreground">
                        <Link href="#about" className="hover:text-foreground transition-colors">Về chúng tôi</Link>
                    </nav>
                    <div className="flex items-center gap-4">
                        <Link href="/login">
                            <Button variant="ghost" size="sm">Đăng nhập</Button>
                        </Link>
                        <Link href="/register">
                            <Button size="sm">Bắt đầu ngay</Button>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="flex-1">
                {/* Hero Section */}
                <section className="container py-24 md:py-32 space-y-8 text-center">
                    <div className="mx-auto max-w-3xl space-y-4">
                        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl text-foreground">
                            Education Automation Hub <span className="text-primary">(EAH)</span>
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Giải phóng giáo viên khỏi các tác vụ lặp lại. Tập trung vào điều quan trọng nhất: Truyền cảm hứng cho học sinh.
                        </p>
                    </div>
                    <div className="flex justify-center gap-4">
                        <Link href="/register">
                            <Button size="lg" className="h-12 px-8 text-base">
                                Dùng thử miễn phí <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                        <Link href="#demo">
                            <Button variant="outline" size="lg" className="h-12 px-8 text-base">
                                Xem Demo
                            </Button>
                        </Link>
                    </div>

                    {/* Hero Image Placeholder */}
                    <div className="mt-16 rounded-xl border bg-muted/50 p-2 shadow-2xl mx-auto max-w-5xl overflow-hidden">
                        <img
                            src="/dashboard.png"
                            alt="Dashboard Preview"
                            className="w-full h-auto rounded-lg"
                        />
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="container py-24 bg-slate-50 dark:bg-slate-900/50">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold tracking-tight mb-4">Mọi công cụ bạn cần</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Tích hợp đầy đủ các tính năng quản lý lớp học, điểm danh, và báo cáo tự động trong một nền tảng duy nhất.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Users className="h-10 w-10 text-primary" />}
                            title="Quản lý Sinh viên"
                            description="Theo dõi hồ sơ, tiến độ học tập và thông tin liên lạc của từng sinh viên một cách dễ dàng."
                        />
                        <FeatureCard
                            icon={<CheckCircle2 className="h-10 w-10 text-accent" />}
                            title="Điểm danh Thông minh"
                            description="Hệ thống điểm danh tự động qua mã QR/Code, tiết kiệm thời gian đầu giờ học."
                        />
                        <FeatureCard
                            icon={<BarChart3 className="h-10 w-10 text-blue-500" />}
                            title="Báo cáo Tự động"
                            description="Tự động tổng hợp số liệu, tạo biểu đồ và gửi báo cáo định kỳ qua email."
                        />
                        <FeatureCard
                            icon={<Shield className="h-10 w-10 text-purple-500" />}
                            title="Bảo mật Tuyệt đối"
                            description="Dữ liệu của nhà trường và sinh viên được mã hóa và bảo vệ theo tiêu chuẩn cao nhất."
                        />
                        <FeatureCard
                            icon={<Zap className="h-10 w-10 text-yellow-500" />}
                            title="Workflow Tùy chỉnh"
                            description="Tự thiết kế quy trình làm việc tự động hóa phù hợp với nhu cầu riêng của bạn."
                        />
                        <FeatureCard
                            icon={<ArrowRight className="h-10 w-10 text-red-500" />}
                            title="Tích hợp Dễ dàng"
                            description="Kết nối với các công cụ bạn đang sử dụng như Google Classroom, Microsoft Teams."
                        />
                    </div>
                </section>
            </main>

            <footer className="border-t py-12 bg-muted/30">
                <div className="container grid md:grid-cols-4 gap-8">
                    <div>
                        <div className="flex items-center gap-2 font-bold text-xl text-primary mb-4">
                            <img src="/logo.svg" alt="EAH Logo" className="h-8 w-auto" />
                            <span>Education Automation Hub</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Nền tảng tự động hóa giáo dục hàng đầu.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Sản phẩm</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="#">Tính năng</Link></li>
                            <li><Link href="#">Bảng giá</Link></li>
                            <li><Link href="#">Roadmap</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Tài nguyên</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="#">Tài liệu</Link></li>
                            <li><Link href="#">Blog</Link></li>
                            <li><Link href="#">Cộng đồng</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Pháp lý</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="#">Điều khoản</Link></li>
                            <li><Link href="#">Bảo mật</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="container mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
                    © 2024 Education Automation Hub (EAH). All rights reserved.
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="p-6 rounded-2xl border bg-card hover:shadow-lg transition-shadow">
            <div className="mb-4 bg-muted/50 w-16 h-16 rounded-xl flex items-center justify-center">
                {icon}
            </div>
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p className="text-muted-foreground">{description}</p>
        </div>
    );
}
