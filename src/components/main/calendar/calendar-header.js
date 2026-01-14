"use client";

import AddSubButton from "@/components/buttons/add-subscription";

export default function CalendarHeader() {
    return (
        <div className="grid grid-cols-1 md:flex md:items-start md:justify-between gap-6 md:gap-4">
            <div>
                <h1 className="text-2xl font-semibold">Calendar</h1>
                <p className="text-sm text-silver">Subscription start and renewal dates.</p>
            </div>

            <AddSubButton />
        </div>
    );
}
