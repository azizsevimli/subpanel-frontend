"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function PlatformSelectSection({
    platforms,
    selectedPlatformId,
    onChange,
    selectedPlatform,
}) {
    return (
        <section className="rounded-3xl border border-jet p-6 space-y-3">
            <h2 className="text-lg font-semibold">Choose Platform</h2>

            <Select value={selectedPlatformId} onValueChange={onChange}>
                <SelectTrigger className="w-full h-[35px] pl-3 rounded-[15px] border border-jet bg-smoke text-night text-sm">
                    <SelectValue placeholder="Select a platform..." />
                </SelectTrigger>

                <SelectContent className="mt-10 rounded-[15px] border border-jet bg-night text-smoke">
                    {platforms.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                            {p.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {!selectedPlatform ? (
                <p className="text-sm text-silver">The platform has not been selected yet.</p>
            ) : null}
        </section>
    );
}
