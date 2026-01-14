"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

import LoadingSpinner from "@/components/loading-spinner";

function formatAmount(amount, currency) {
    if (amount == null) return "";
    const n = Number(amount);
    if (Number.isNaN(n)) return "";
    return ` • ${n.toFixed(2)} ${currency || ""}`.trimEnd();
}

export default function CalendarShell({
    events,
    loading,
    onDatesSet,
    onEventClick,
}) {
    return (
        <section className="relative px-2 py-4 md:p-6 md:rounded-3xl border-t-2 border-b-2 md:border border-jet">
            <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                height="auto"
                events={events}
                datesSet={onDatesSet}
                eventClick={onEventClick}
                eventDidMount={(info) => {
                    const p = info.event.extendedProps || {};
                    const amountText = formatAmount(p.amount, p.currency);
                    info.el.title = `${info.event.title}${amountText}`;
                }}
            />

            {loading ? (
                <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-night/60">
                    <LoadingSpinner />
                </div>
            ) : null}
        </section>
    );
}
