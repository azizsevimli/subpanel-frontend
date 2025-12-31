"use client";

import LoadingSpinner from "@/components/loading-spinner";
import FieldPreview from "@/components/main/subscription/field-preview";

export default function PlatformFieldsSection({
    selectedPlatformId,
    loadingFields,
    fields,
    fieldValues,
    onChangeFieldValue,
}) {
    return (
        <section className="rounded-3xl border border-jet p-6 space-y-4">
            <h2 className="text-lg font-semibold">Platform Fields</h2>

            {!selectedPlatformId ? (
                <p className="text-sm text-silver">Please select the platform first.</p>
            ) : loadingFields ? (
                <div className="flex justify-center py-8">
                    <LoadingSpinner />
                </div>
            ) : fields.length === 0 ? (
                <p className="text-sm text-silver border border-jet rounded-xl px-4 py-6 text-center">
                    There is no defined field for this platform.
                </p>
            ) : (
                <div className="space-y-5">
                    {fields.map((f) => (
                        <div key={f.id} className="p-5 rounded-3xl border border-jet">
                            <FieldPreview
                                field={f}
                                value={fieldValues?.[f.id]}
                                onChange={(val) => onChangeFieldValue(f.id, val)}
                            />
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
