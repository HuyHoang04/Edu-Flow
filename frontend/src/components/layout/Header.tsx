"use client";

import { Bell, User } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export function Header() {
    return (
        <header className="fixed left-64 right-0 top-0 z-10 h-16 border-b bg-card">
            <div className="flex h-full items-center justify-between px-6">
                <div>
                    <h2 className="text-lg font-semibold">Xin chào, Giáo viên</h2>
                    <p className="text-sm text-muted-foreground">
                        {new Date().toLocaleDateString("vi-VN", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                        })}
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <ThemeToggle />

                    <button className="relative rounded-full p-2 hover:bg-muted">
                        <Bell className="h-5 w-5" />
                        <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
                    </button>

                    <button className="flex items-center gap-2 rounded-lg border px-3 py-2 hover:bg-muted">
                        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                            <User className="h-5 w-5" />
                        </div>
                        <span className="text-sm font-medium">Tài khoản</span>
                    </button>
                </div>
            </div>
        </header>
    );
}
