"use client";

import AddSubButton from "@/components/buttons/add-subscription";

export default function SubscriptionsHeader({ total }) {
    const totalText = total === 1 ? "1 subscription" : `${total} subscriptions`;

    return (
        <div className="grid grid-cols-1 md:flex md:items-start md:justify-between gap-4">
            <div>
                <h1 className="text-2xl font-semibold">My Subscriptions</h1>
                <p className="text-sm text-silver">Your saved subscriptions. <br /> ({totalText})</p>
            </div>

            <AddSubButton />
        </div>
    );
}
