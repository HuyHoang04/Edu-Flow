import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Activity {
    id: string;
    user: {
        name: string;
        avatar?: string;
        initials: string;
    };
    action: string;
    time: string;
}

interface RecentActivityProps {
    activities: Activity[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
    return (
        <Card className="col-span-3">
            <CardHeader>
                <CardTitle>Hoạt động gần đây</CardTitle>
                <CardDescription>
                    Các tác vụ vừa được thực hiện trên hệ thống
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-8">
                    {activities.map((activity) => (
                        <div key={activity.id} className="flex items-center">
                            <Avatar className="h-9 w-9">
                                <AvatarImage src={activity.user.avatar} alt="Avatar" />
                                <AvatarFallback>{activity.user.initials}</AvatarFallback>
                            </Avatar>
                            <div className="ml-4 space-y-1">
                                <p className="text-sm font-medium leading-none">{activity.user.name}</p>
                                <p className="text-sm text-muted-foreground">
                                    {activity.action}
                                </p>
                            </div>
                            <div className="ml-auto font-medium text-sm text-muted-foreground">{activity.time}</div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
