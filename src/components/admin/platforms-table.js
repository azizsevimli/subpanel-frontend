"use client";

import Image from "next/image";
import { Pencil, Trash2, ExternalLink } from "lucide-react";
import { toAbsoluteUrl } from "@/lib/uploads";

export default function PlatformsTable({ platforms, onDelete, onEdit }) {
    return (
        <div className="border border-jet rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
                <thead className="bg-jet text-silver">
                    <tr>
                        <th className="text-left px-4 py-3">Name</th>
                        <th className="text-left px-4 py-3">Slug</th>
                        <th className="text-left px-4 py-3">Status</th>
                        <th className="text-left px-4 py-3">Plans</th>
                        <th className="text-left px-4 py-3">Website</th>
                        <th className="text-left px-4 py-3">Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {platforms.map((p) => {
                        const plansCount =
                            typeof p?.plansCount === "number"
                                ? p.plansCount
                                : Array.isArray(p?.plans)
                                    ? p.plans.length
                                    : 0;

                        return (
                            <tr
                                key={p.id}
                                className="border-t border-jet hover:bg-jet/60 transition"
                            >
                                <td className="px-4 py-2">
                                    <div className="flex items-center gap-3">
                                        {p.logoUrl ? (
                                            <Image
                                                src={toAbsoluteUrl(p.logoUrl)}
                                                alt={p.name}
                                                width={32}
                                                height={32}
                                                className="rounded-lg border border-jet object-cover"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 rounded-lg border border-jet" />
                                        )}

                                        <div className="flex flex-col min-w-0">
                                            <span className="font-medium">{p.name}</span>
                                            {p.description ? (
                                                <span className="text-xs text-silver truncate max-w-[320px]">
                                                    {p.description}
                                                </span>
                                            ) : null}
                                        </div>
                                    </div>
                                </td>

                                <td className="px-4 py-2 text-silver">{p.slug}</td>

                                <td className="px-4 py-2">
                                    <span
                                        className={
                                            p.status === "ACTIVE"
                                                ? "px-2 py-1 rounded-full bg-info/20 text-info text-xs"
                                                : "px-2 py-1 rounded-full bg-jet text-silver text-xs"
                                        }
                                    >
                                        {p.status}
                                    </span>
                                </td>

                                <td className="px-4 py-2">
                                    <span className="text-silver">{plansCount}</span>
                                </td>

                                <td className="px-4 py-2">
                                    {p.websiteUrl ? (
                                        <a
                                            href={p.websiteUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-1 underline text-info"
                                        >
                                            Visit <ExternalLink size={14} />
                                        </a>
                                    ) : (
                                        <span className="text-silver">-</span>
                                    )}
                                </td>

                                <td className="px-4 py-2">
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => onEdit?.(p.id)}
                                            className="px-3 py-2 rounded-full border border-jet hover:bg-jet transition"
                                            aria-label={`Edit ${p.name}`}
                                        >
                                            <Pencil size={16} />
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => onDelete?.(p.id)}
                                            className="px-3 py-2 rounded-full border border-jet hover:bg-jet transition text-wrong"
                                            aria-label={`Delete ${p.name}`}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
