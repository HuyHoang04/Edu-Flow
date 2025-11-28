import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, GraduationCap, CheckSquare, TrendingUp, Loader2 } from "lucide-react";

interface StatsCardsProps {
    stats: {
        title: string;
        value: string;
        change: string;
        icon: any;
        color: string;
        bgColor: string;
    }[];
    isLoading: boolean;
}

export function StatsCards({ stats, isLoading }: StatsCardsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                    <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {stat.title}
                            </CardTitle>
                            <div className={`rounded-full p-2 ${stat.bgColor}`}>
                                <Icon className={`h-4 w-4 ${stat.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {isLoading && stat.value === "..." ? (
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                ) : (
                                    stat.value
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {stat.change}
                            </p>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
