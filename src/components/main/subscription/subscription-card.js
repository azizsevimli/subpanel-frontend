"use client";

import Image from "next/image";

import { toAbsoluteUrl } from "@/lib/uploads";

import BorderButton from "@/components/buttons/border-button";
import Button from "@/components/buttons/button";

function formatValue(val) {
    if (val === null || val === undefined) return "-";
    if (Array.isArray(val)) return val.join(", ");
    if (typeof val === "object") return JSON.stringify(val);
    return String(val);
}

function safeDateTimeText(v) {
    if (!v) return "-";
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleString();
}

function safeYmd(v) {
    if (!v) return "-";
    const s = String(v);
    return s.length >= 10 ? s.slice(0, 10) : s;
}

function formatAmount(amount, currency) {
    const n = Number(amount);
    if (amount == null || Number.isNaN(n)) return "-";
    return `${n.toFixed(2)} ${currency || ""}`.trim();
}

export default function SubscriptionCard({ sub, onEdit, onDelete }) {
    const logoSrc = sub.platform?.logoUrl ? toAbsoluteUrl(sub.platform.logoUrl) : "";
    const createdText = safeDateTimeText(sub.createdAt);

    const startDateText = safeYmd(sub.startDate);
    const repeatUnit = sub.repeatUnit || "-";
    const repeatInterval = sub.repeatInterval ?? "-";

    const amountText = formatAmount(sub.amount, sub.currency);

    return (
        <div className="px-3 py-6 md:p-6 rounded-2xl md:rounded-3xl border border-jet space-y-4">
            {/* Platform header */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                    {logoSrc ? (
                        <div className="p-2 rounded-lg border border-jet overflow-hidden">
                            <Image
                                src={logoSrc}
                                alt={sub.platform?.name || "platform"}
                                width={48}
                                height={48}
                                className="object-cover"
                            />
                        </div>
                    ) : (
                        <div className="w-12 h-12 rounded-lg border border-jet" />
                    )}

                    <div className="min-w-0">
                        <p className="font-semibold truncate">{sub.platform?.name || "Platform"}</p>
                        <p className="text-xs text-silver truncate">Created: {createdText}</p>
                    </div>
                </div>

                <div className="text-right">
                    <p className="text-xs text-silver">Status</p>
                    <p className="text-sm">{sub.status || "-"}</p>
                </div>
            </div>

            {/* Subscription summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div className="px-4 py-3 rounded-lg md:rounded-2xl border-2 border-jet">
                    <p className="text-xs text-silver">Start Date</p>
                    <p className="mt-1">{startDateText}</p>
                </div>

                <div className="px-4 py-3 rounded-lg md:rounded-2xl border-2 border-jet">
                    <p className="text-xs text-silver">Repeat</p>
                    <p className="mt-1">
                        Every {repeatInterval} {repeatUnit}
                    </p>
                </div>

                <div className="px-4 py-3 rounded-lg md:rounded-2xl border-2 border-jet">
                    <p className="text-xs text-silver">Amount</p>
                    <p className="mt-1">{amountText}</p>
                </div>
            </div>

            {/* Fields */}
            <div className="rounded-lg md:rounded-2xl border border-jet overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-jet text-silver">
                        <tr>
                            <th className="text-left px-4 py-2">Field</th>
                            <th className="text-left px-4 py-2">Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(sub.fields || []).map((f) => (
                            <tr key={f.fieldId} className="border-t border-jet">
                                <td className="px-4 py-2">
                                    <span className="font-medium">{f.label}</span>
                                </td>
                                <td className="px-4 py-2 text-silver">{formatValue(f.value)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-end gap-3">
                <BorderButton
                    text="Delete"
                    onClick={onDelete}
                    className="border-wrong hover:bg-wrong text-wrong"
                />
                <Button text="Edit" onClick={onEdit} />
            </div>
        </div>
    );
}
