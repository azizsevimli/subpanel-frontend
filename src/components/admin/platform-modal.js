"use client";

import { useEffect, useMemo, useState } from "react";
import BorderButton from "@/components/buttons/border-button";
import FormInput from "@/components/inputs/input";
import api from "@/lib/api";
import { uploadPlatformLogo, toAbsoluteUrl } from "@/lib/uploads";

const DEFAULT_FORM = {
    name: "",
    slug: "",
    description: "",
    websiteUrl: "",
    status: "ACTIVE",

    // logo için:
    logoUrl: "",     // DB'ye giden alan (string)
    logoFile: null,  // sadece UI'da seçilen file
};

export default function PlatformModal({ open, onClose, initialData, onSaved }) {
    const isEdit = !!initialData?.id;

    const [form, setForm] = useState(DEFAULT_FORM);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!open) {
            setForm(DEFAULT_FORM);
            setError("");
            setSubmitting(false);
            return;
        }

        if (isEdit) {
            setForm({
                name: initialData?.name || "",
                slug: initialData?.slug || "",
                description: initialData?.description || "",
                websiteUrl: initialData?.websiteUrl || "",
                status: initialData?.status || "ACTIVE",
                logoUrl: initialData?.logoUrl || "",
                logoFile: null,
            });
        } else {
            setForm(DEFAULT_FORM);
        }

        setError("");
        setSubmitting(false);
    }, [open, isEdit, initialData]);

    const previewUrl = useMemo(() => {
        // File seçildiyse onu göster, yoksa logoUrl’yi göster
        if (form.logoFile) return URL.createObjectURL(form.logoFile);
        if (form.logoUrl) return toAbsoluteUrl(form.logoUrl);
        return "";
    }, [form.logoFile, form.logoUrl]);

    useEffect(() => {
        // URL.createObjectURL cleanup (memory leak önlemek)
        if (!form.logoFile) return;
        const objUrl = URL.createObjectURL(form.logoFile);
        return () => URL.revokeObjectURL(objUrl);
    }, [form.logoFile]);

    if (!open) return null;

    function setField(field) {
        return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
    }

    function handleFileChange(e) {
        const file = e.target.files?.[0] || null;
        setForm((prev) => ({ ...prev, logoFile: file }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setSubmitting(true);

        try {
            const name = form.name.trim();
            if (!name) {
                setError("Platform adı zorunludur.");
                setSubmitting(false);
                return;
            }

            let logoUrlToSave = form.logoUrl;

            // 1. adım: file seçildiyse upload et
            if (form.logoFile) {
                logoUrlToSave = await uploadPlatformLogo(form.logoFile);
            }

            // 2. adım: platform create/update
            const payload = {
                name,
                slug: form.slug.trim() || undefined,
                description: form.description.trim() || undefined,
                websiteUrl: form.websiteUrl.trim() || undefined,
                logoUrl: logoUrlToSave || undefined,
                status: form.status,
            };

            if (isEdit) {
                await api.patch(`/admin/platforms/${initialData.id}`, payload);
            } else {
                await api.post("/admin/platforms", payload);
            }

            if (onSaved) await onSaved();
        } catch (err) {
            console.error(err);
            setError(err?.response?.data?.message || "Kayıt sırasında hata oluştu.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="w-full max-w-xl rounded-2xl border border-jet bg-night p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">
                        {isEdit ? "Edit Platform" : "New Platform"}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-silver hover:text-smoke text-sm"
                    >
                        Close
                    </button>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <FormInput
                        type="text"
                        placeholder="name"
                        value={form.name}
                        onChange={setField("name")}
                    />

                    <FormInput
                        type="text"
                        placeholder="slug (optional)"
                        value={form.slug}
                        onChange={setField("slug")}
                    />

                    <FormInput
                        type="text"
                        placeholder="websiteUrl (optional)"
                        value={form.websiteUrl}
                        onChange={setField("websiteUrl")}
                    />

                    {/* Logo upload */}
                    <div className="space-y-2">
                        <label className="text-sm text-silver">Logo (optional)</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="w-full border border-jet rounded-2xl bg-night px-4 py-3 outline-none text-sm"
                        />

                        {previewUrl ? (
                            <div className="flex items-center gap-3">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={previewUrl}
                                    alt="logo preview"
                                    className="w-16 h-16 rounded-xl border border-jet object-cover"
                                />
                                <button
                                    type="button"
                                    className="text-sm underline text-wrong"
                                    onClick={() =>
                                        setForm((prev) => ({ ...prev, logoFile: null, logoUrl: "" }))
                                    }
                                >
                                    Remove logo
                                </button>
                            </div>
                        ) : (
                            <p className="text-xs text-silver">No logo selected.</p>
                        )}
                    </div>

                    <textarea
                        value={form.description}
                        onChange={setField("description")}
                        placeholder="description (optional)"
                        className="w-full border border-jet rounded-2xl bg-night px-4 py-3 outline-none text-sm min-h-[110px]"
                    />

                    <select
                        value={form.status}
                        onChange={setField("status")}
                        className="w-full border border-jet rounded-2xl bg-night px-4 py-3 outline-none text-sm"
                    >
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="INACTIVE">INACTIVE</option>
                    </select>

                    {error && <p className="text-sm text-wrong font-light">{error}</p>}

                    <div className="flex justify-end">
                        <BorderButton
                            text={submitting ? "Saving..." : "Save"}
                            className="font-semibold"
                            disabled={submitting}
                        />
                    </div>
                </form>
            </div>
        </div>
    );
}
