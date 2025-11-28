"use client";

import { useSession, signOut } from "next-auth/react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, Settings, User as UserIcon } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { NotificationBell } from "./NotificationBell";

export function Header() {
    const { data: session } = useSession();
    const user = session?.user;

    return (
        <header className="fixed left-64 right-0 top-0 z-10 h-16 border-b bg-card">
            <div className="flex h-full items-center justify-between px-6">
                <div>
                    <h2 className="text-lg font-semibold">Xin chào, {user?.name || "Giáo viên"}</h2>
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
                    <NotificationBell />

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex items-center gap-2 rounded-lg border px-3 py-2 hover:bg-muted outline-none">
                                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground overflow-hidden">
                                    {user?.image ? (
                                        <img src={user.image} alt={user.name || "User"} className="h-full w-full object-cover" />
                                    ) : (
                                        <UserIcon className="h-5 w-5" />
                                    )}
                                </div>
                                <div className="flex flex-col items-start">
                                    <span className="text-sm font-medium">{user?.name || "Tài khoản"}</span>
                                    <span className="text-xs text-muted-foreground">Giáo viên</span>
                                </div>
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                                <UserIcon className="mr-2 h-4 w-4" />
                                <span>Hồ sơ</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Settings className="mr-2 h-4 w-4" />
                                <span>Cài đặt</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => signOut({ callbackUrl: "/login" })}>
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Đăng xuất</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}
