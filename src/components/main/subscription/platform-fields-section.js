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
        <section className=" px-3 py-6 md:p-6 rounded-2xl md:rounded-3xl border border-jet space-y-4">
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
                        <div key={f.id}>
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
