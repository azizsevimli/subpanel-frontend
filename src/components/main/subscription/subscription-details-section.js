"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ReqOptLabel from "@/components/required-optional-label";

export default function SubscriptionDetailsSection({
    selectedPlatformId,
    hasActivePlans,
    plans,
    tracking,
    onChangeTrackingField,
}) {
    const planDisabled = !hasActivePlans;

    const currencies = [
        { value: "TRY", label: "Turkish Lira (TRY)" },
        { value: "USD", label: "US Dollar (USD)" },
        { value: "EUR", label: "Euro (EUR)" },
        { value: "GBP", label: "British Pound (GBP)" },
    ];


    return (
        <section className="px-3 py-6 md:p-6 rounded-2xl md:rounded-3xl border border-jet space-y-4">
            <h2 className="text-lg font-semibold">Subscription Details</h2>

            {/* Plan (required if active plans exist) */}
            {selectedPlatformId ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                    <ReqOptLabel required={hasActivePlans}>Plan</ReqOptLabel>

                    <div className="md:col-span-3">
                        <Select
                            value={tracking.planId || ""}
                            onValueChange={(v) => onChangeTrackingField("planId", v)}
                            disabled={planDisabled}
                        >
                            <SelectTrigger className="w-full h-[35px] pl-3 rounded-[15px] border border-jet bg-smoke text-night text-sm">
                                <SelectValue placeholder={hasActivePlans ? "Select a plan..." : "No active plans"} />
                            </SelectTrigger>

                            <SelectContent className="mt-10 rounded-[15px] border border-jet bg-night text-smoke">
                                {plans.map((p) => (
                                    <SelectItem key={p.id} value={String(p.id)}>
                                        {p.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            ) : null}

            {/* Status */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                <ReqOptLabel required>Status</ReqOptLabel>

                <div className="md:col-span-3">
                    <Select
                        value={tracking.status}
                        onValueChange={(v) => onChangeTrackingField("status", v)}
                    >
                        <SelectTrigger className="w-full h-[35px] pl-3 rounded-[15px] border border-jet bg-smoke text-night text-sm">
                            <SelectValue placeholder="Select status..." />
                        </SelectTrigger>

                        <SelectContent className="mt-10 rounded-[15px] border border-jet bg-night text-smoke">
                            <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                            <SelectItem value="PAUSED">PAUSED</SelectItem>
                            <SelectItem value="CANCELED">CANCELED</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <ReqOptLabel required>Start Date</ReqOptLabel>
                    <input
                        type="date"
                        value={tracking.startDate}
                        onChange={(e) => onChangeTrackingField("startDate", e.target.value)}
                        className="w-full h-[35px] px-3 rounded-[15px] border border-jet outline-none bg-smoke text-sm text-night"
                    />
                </div>

                <div className="space-y-2">
                    <ReqOptLabel optional>End Date</ReqOptLabel>
                    <input
                        type="date"
                        value={tracking.endDate}
                        onChange={(e) => onChangeTrackingField("endDate", e.target.value)}
                        className="w-full h-[35px] px-3 rounded-[15px] border border-jet outline-none bg-smoke text-sm text-night"
                    />
                </div>
            </div>

            {/* Repeat */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <ReqOptLabel required>Repeat Unit</ReqOptLabel>

                    <Select
                        value={tracking.repeatUnit}
                        onValueChange={(v) => onChangeTrackingField("repeatUnit", v)}
                    >
                        <SelectTrigger className="w-full h-[35px] pl-3 rounded-[15px] border border-jet bg-smoke text-night text-sm">
                            <SelectValue placeholder="Select unit..." />
                        </SelectTrigger>

                        <SelectContent className="mt-10 rounded-[15px] border border-jet bg-night text-smoke">
                            <SelectItem value="WEEK">WEEK</SelectItem>
                            <SelectItem value="MONTH">MONTH</SelectItem>
                            <SelectItem value="YEAR">YEAR</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <ReqOptLabel required>Repeat Interval</ReqOptLabel>
                    <input
                        type="number"
                        min={1}
                        value={tracking.repeatInterval}
                        onChange={(e) => onChangeTrackingField("repeatInterval", e.target.value)}
                        placeholder="1"
                        className="w-full h-[35px] px-3 rounded-[15px] border border-jet outline-none bg-smoke text-sm text-night"
                    />
                    <p className="ml-2 text-xs text-silver">1 = every unit</p>
                </div>
            </div>

            {/* Amount + Currency */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <ReqOptLabel optional>Amount</ReqOptLabel>
                    <input
                        type="number"
                        step="0.01"
                        value={tracking.amount}
                        onChange={(e) => onChangeTrackingField("amount", e.target.value)}
                        placeholder="0.00"
                        className="w-full h-[35px] px-3 rounded-[15px] border border-jet outline-none bg-smoke text-sm text-night"
                    />
                </div>
                <div className="space-y-2">
                    <ReqOptLabel optional>Currency</ReqOptLabel>

                    <Select
                        value={tracking.currency || ""}
                        onValueChange={(v) => onChangeTrackingField("currency", v)}
                    >
                        <SelectTrigger className="w-full h-[35px] pl-3 rounded-[15px] border border-jet bg-smoke text-night text-sm">
                            <SelectValue placeholder="Select currency..." />
                        </SelectTrigger>

                        <SelectContent className="mt-10 rounded-[15px] border border-jet bg-night text-smoke">
                            {currencies.map((c) => (
                                <SelectItem key={c.value} value={c.value}>
                                    {c.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Account Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <ReqOptLabel optional>Account Email</ReqOptLabel>
                    <input
                        type="email"
                        value={tracking.accountEmail}
                        onChange={(e) => onChangeTrackingField("accountEmail", e.target.value)}
                        placeholder="email@example.com"
                        className="w-full h-[35px] px-3 rounded-[15px] border border-jet outline-none bg-smoke text-sm text-night"
                    />
                </div>

                <div className="space-y-2">
                    <ReqOptLabel optional>Account Phone</ReqOptLabel>
                    <input
                        type="text"
                        value={tracking.accountPhone}
                        onChange={(e) => onChangeTrackingField("accountPhone", e.target.value)}
                        placeholder="+90..."
                        className="w-full h-[35px] px-3 rounded-[15px] border border-jet outline-none bg-smoke text-sm text-night"
                    />
                </div>
            </div>

            {/* Notes */}
            <div className="space-y-2 md:col-span-3">
                <ReqOptLabel optional>Notes</ReqOptLabel>
                <textarea
                    value={tracking.notes}
                    onChange={(e) => onChangeTrackingField("notes", e.target.value)}
                    placeholder="Optional notes..."
                    className="w-full min-h-[90px] px-3 py-2 rounded-[15px] border border-jet outline-none bg-smoke text-sm text-night"
                />
            </div>
        </section>
    );
}
