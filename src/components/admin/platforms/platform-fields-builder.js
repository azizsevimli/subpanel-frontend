"use client";

import { Plus } from "lucide-react";
import BorderButton from "@/components/buttons/border-button";
import PlatformFieldCard from "@/components/admin/platforms/platform-field-card";

export default function PlatformFieldsBuilder({
    fields,
    onAddField,
    onRemoveField,
    onUpdateField,
    normalizeKey,
    onAddOption,
    onUpdateOption,
    onRemoveOption,
}) {
    return (
        <section className="rounded-3xl border border-jet p-6 space-y-4">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h2 className="text-lg font-semibold">Platform Fields</h2>
                    <p className="text-sm text-silver">
                        Add fields specific to this platform. You can add/remove anytime.
                    </p>
                </div>
                <BorderButton
                    type="button"
                    text="Add Field"
                    icon={<Plus size={16} strokeWidth={3} />}
                    onClick={onAddField}
                />
            </div>

            <div className="space-y-4">
                {fields.map((field, index) => (
                    <PlatformFieldCard
                        key={index}
                        field={field}
                        index={index}
                        canRemove={fields.length > 1}
                        normalizeKey={normalizeKey}
                        onRemove={() => onRemoveField(index)}
                        onUpdate={(patch) => onUpdateField(index, patch)}
                        onAddOption={() => onAddOption(index)}
                        onUpdateOption={(optIndex, patch) => onUpdateOption(index, optIndex, patch)}
                        onRemoveOption={(optIndex) => onRemoveOption(index, optIndex)}
                    />
                ))}
            </div>
        </section>
    );
}
