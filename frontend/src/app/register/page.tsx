"use client";

import { useState } from "react";
import { Loader2, Zap, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        const firstName = formData.get("firstName");
        const lastName = formData.get("lastName");
        const email = formData.get("email");
        const password = formData.get("password");

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;
            await axios.post(`${apiUrl}/auth/register`, {
                firstName,
                lastName,
                email,
                password,
            });

            // Auto login after register
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                console.error("Login failed after register:", result.error);
                router.push("/login");
            } else {
                router.push("/dashboard");
            }
        } catch (error) {
            console.error("Registration failed:", error);
            // TODO: Show error toast
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
                        <h1 className="text-3xl font-bold tracking-tight">Tạo tài khoản</h1>
                        <p className="text-muted-foreground">
                            Bắt đầu hành trình tự động hóa giảng dạy của bạn.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <form onSubmit={handleRegister} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">Họ</Label>
                                    <Input id="firstName" name="firstName" placeholder="Nguyễn" required disabled={isLoading} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Tên</Label>
                                    <Input id="lastName" name="lastName" placeholder="Văn A" required disabled={isLoading} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" name="email" placeholder="name@example.com" type="email" required disabled={isLoading} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Mật khẩu</Label>
                                <Input id="password" name="password" type="password" required disabled={isLoading} />
                            </div>

                            <Button className="w-full h-11" type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Đăng ký tài khoản
                            </Button>
                        </form>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">
                                    Hoặc đăng ký với
                                </span>
                            </div>
                        </div>

                        <Button variant="outline" className="w-full" onClick={() => signIn("google", { callbackUrl: "/dashboard" })} disabled={isLoading}>
                            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
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
                            Google
                        </Button>
                    </div>

                    <p className="text-center text-sm text-muted-foreground">
                        Đã có tài khoản?{" "}
                        <Link href="/login" className="font-semibold text-primary hover:underline">
                            Đăng nhập
                        </Link>
                    </p>
                </div>
            </div>

            {/* Right Side - Visual */}
            <div className="hidden lg:flex flex-col justify-center p-12 bg-primary text-primary-foreground relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-primary/0" />
                <div className="relative z-10 max-w-lg mx-auto text-center space-y-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur mb-4">
                        <Zap className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold">Tham gia cộng đồng EAH</h2>
                    <p className="text-primary-foreground/80 text-lg">
                        Kết nối với hàng ngàn giáo viên khác và chia sẻ các workflow giảng dạy hiệu quả trên Education Automation Hub.
                    </p>
                </div>
            </div>
        </div>
    );
}
