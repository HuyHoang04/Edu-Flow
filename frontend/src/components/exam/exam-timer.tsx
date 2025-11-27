"use client";

import { useEffect, useState } from "react";
import { Clock, AlertCircle } from "lucide-react";

interface ExamTimerProps {
    durationMinutes: number;
    startedAt: string;
    onTimeExpired: () => void;
}

export function ExamTimer({ durationMinutes, startedAt, onTimeExpired }: ExamTimerProps) {
    const [timeRemaining, setTimeRemaining] = useState(0);

    useEffect(() => {
        const calculateTimeRemaining = () => {
            const start = new Date(startedAt).getTime();
            const end = start + durationMinutes * 60 * 1000;
            const now = Date.now();
            return Math.max(0, end - now);
        };

        setTimeRemaining(calculateTimeRemaining());

        const interval = setInterval(() => {
            const remaining = calculateTimeRemaining();
            setTimeRemaining(remaining);

            if (remaining === 0) {
                clearInterval(interval);
                onTimeExpired();
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [durationMinutes, startedAt, onTimeExpired]);

    const minutes = Math.floor(timeRemaining / 60000);
    const seconds = Math.floor((timeRemaining % 60000) / 1000);
    const isLowTime = minutes < 5;

    return (
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${isLowTime ? "bg-destructive/10 border-destructive text-destructive" : "bg-muted"
            }`}>
            {isLowTime ? (
                <AlertCircle className="h-5 w-5 animate-pulse" />
            ) : (
                <Clock className="h-5 w-5" />
            )}
            <span className="font-mono text-lg font-semibold">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
        </div>
    );
}
