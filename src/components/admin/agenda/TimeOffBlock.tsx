import { TimeOff } from "@/lib/agenda/types";
import { differenceInMinutes, parseISO, startOfDay } from "date-fns";
import { cn } from "@/lib/utils";

interface TimeOffBlockProps {
    timeOff: TimeOff;
    style: React.CSSProperties;
}

export function TimeOffBlock({ timeOff, style }: TimeOffBlockProps) {
    return (
        <div
            className={cn(
                "absolute w-full px-2 py-1 text-xs border rounded shadow-sm overflow-hidden z-10",
                "bg-gray-100 border-gray-200 text-gray-500 opacity-90 striped-pattern cursor-not-allowed"
            )}
            style={style}
            title={`Bloqueio: ${timeOff.reason}`}
        >
            <span className="font-semibold block truncate">🔒 {timeOff.reason}</span>
            <span className="text-[10px] truncate">
                {timeOff.start_at.slice(11, 16)} - {timeOff.end_at.slice(11, 16)}
            </span>
        </div>
    );
}
