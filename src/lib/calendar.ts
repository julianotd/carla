
import { addMinutes, format } from "date-fns";

type CalendarEvent = {
    title: string;
    description: string;
    location?: string;
    startsAt: Date;
    durationMin: number;
};

export function getGoogleCalendarUrl(event: CalendarEvent) {
    const start = format(event.startsAt, "yyyyMMdd'T'HHmmss");
    const end = format(addMinutes(event.startsAt, event.durationMin), "yyyyMMdd'T'HHmmss");

    const params = new URLSearchParams({
        action: "TEMPLATE",
        text: event.title,
        dates: `${start}/${end}`,
        details: event.description,
        location: event.location || "",
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function getOutlookCalendarUrl(event: CalendarEvent) {
    const start = event.startsAt.toISOString();
    const end = addMinutes(event.startsAt, event.durationMin).toISOString();

    const params = new URLSearchParams({
        path: "/calendar/action/compose",
        rru: "addevent",
        startdt: start,
        enddt: end,
        subject: event.title,
        body: event.description,
        location: event.location || "",
    });

    return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

export function getICalUrl(event: CalendarEvent) {
    const start = format(event.startsAt, "yyyyMMdd'T'HHmmss");
    const end = format(addMinutes(event.startsAt, event.durationMin), "yyyyMMdd'T'HHmmss");
    const now = format(new Date(), "yyyyMMdd'T'HHmmss");

    const content = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "BEGIN:VEVENT",
        `DTSTAMP:${now}`,
        `DTSTART:${start}`,
        `DTEND:${end}`,
        `SUMMARY:${event.title}`,
        `DESCRIPTION:${event.description}`,
        `LOCATION:${event.location || ""}`,
        "END:VEVENT",
        "END:VCALENDAR"
    ].join("\n");

    return `data:text/calendar;charset=utf8,${encodeURIComponent(content)}`;
}
