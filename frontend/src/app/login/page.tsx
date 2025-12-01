"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { Loader2, Zap, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        try {
            await signIn("google", { callbackUrl: "/dashboard" });
        } catch (error) {
            console.error("Login failed:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* Left Side - Form */}
            <div className="flex flex-col justify-center p-8 md:p-12 lg:p-16 bg-background">
                <div className="w-full max-w-sm mx-auto space-y-8">
                    <div className="space-y-2">
                        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-4">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại trang chủ
                        </Link>
                        <h1 className="text-3xl font-bold tracking-tight">Đăng nhập</h1>
                        <p className="text-muted-foreground">
                            Chào mừng trở lại! Vui lòng đăng nhập để tiếp tục.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <Button
                            variant="outline"
                            className="w-full h-12 text-base font-medium relative"
                            onClick={handleGoogleLogin}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
                                    <path
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        fill="#4285F4"
                                    />
                                    <path
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        fill="#34A853"
                                    />
                                    <path
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        fill="#FBBC05"
                                    />
                                    <path
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        fill="#EA4335"
                                    />
                                </svg>
                            )}
                            {isLoading ? "Đang kết nối..." : "Đăng nhập với Google"}
                        </Button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">
                                    Hoặc đăng nhập bằng email
                                </span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <form
                                onSubmit={async (e) => {
                                    e.preventDefault();
                                    setIsLoading(true);
                                    const email = (e.currentTarget.elements.namedItem("email") as HTMLInputElement).value;
                                    const password = (e.currentTarget.elements.namedItem("password") as HTMLInputElement).value;
                                    try {
                                        const result = await signIn("credentials", {
                                            email,
                                            password,
                                            redirect: false,
                                        });
                                        if (result?.error) {
                                            console.error("Login failed:", result.error);
                                            // TODO: Show error toast
                                        } else {
                                            window.location.href = "/dashboard";
                                        }
                                    } catch (error) {
                                        console.error("Login error:", error);
                                    } finally {
                                        setIsLoading(false);
                                    }
                                }}
                                className="space-y-4"
                            >
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" name="email" placeholder="name@example.com" type="email" required disabled={isLoading} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Mật khẩu</Label>
                                    <Input id="password" name="password" type="password" required disabled={isLoading} />
                                </div>
                                <Button className="w-full" type="submit" disabled={isLoading}>
                                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Đăng nhập
                                </Button>
                            </form>
                        </div>
                    </div>

                    <p className="text-center text-sm text-muted-foreground">
                        Chưa có tài khoản?{" "}
                        <Link href="/register" className="font-semibold text-primary hover:underline">
                            Đăng ký ngay
                        </Link>
                    </p>
                </div>
            </div>

            {/* Right Side - Visual */}
            <div className="hidden lg:flex flex-col justify-center p-12 bg-slate-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-slate-900/0" />
                <div className="relative z-10 max-w-lg mx-auto text-center space-y-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur mb-4">
                        <Zap className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold">Education Automation Hub (EAH)</h2>
                    <p className="text-slate-300 text-lg">
                        "EAH giúp tôi tiết kiệm 10 giờ mỗi tuần cho việc quản lý lớp học và điểm danh."
                    </p>
                    <div className="pt-4 flex items-center justify-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-slate-700" />
                        <div className="text-left">
                            <p className="font-semibold">Nguyễn Văn A</p>
                            <p className="text-sm text-slate-400">Giảng viên ĐH CNTT</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
