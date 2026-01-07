"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

import { useRequireAdmin } from "@/hooks/useRequireAdmin";
import api from "@/lib/api";
import { uploadPlatformLogo, toAbsoluteUrl } from "@/lib/uploads";

import BorderButton from "@/components/buttons/border-button";
import LoadingSpinner from "@/components/loading-spinner";

import PlatformInfoForm from "@/components/admin/platforms/platform-info-form";
import PlatformFieldsBuilder from "@/components/admin/platforms/platform-fields-builder";

const PLATFORM_DEFAULT = {
    name: "",
    slug: "",
    description: "",
    websiteUrl: "",
    status: "ACTIVE",
    logoUrl: "",
    logoFile: null, // sadece UI
};

function makeField() {
    return {
        key: "",
        label: "",
        type: "TEXT",
        required: false,
        options: [], // UI: [{ label, value }]
    };
}

function makePlan() {
    return {
        name: "",
        isActive: false, // default false
    };
}

function isOptionType(type) {
    return type === "SELECT" || type === "MULTISELECT";
}

function normalizeKey(input) {
    return String(input || "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_ ]/g, "")
        .replace(/\s+/g, "_")
        .replace(/_+/g, "_");
}

function normalizePlanName(input) {
    return String(input || "").trim();
}

export default function EditPlatformPage() {
    const router = useRouter();
    const params = useParams();
    const { loading: authLoading } = useRequireAdmin();

    const platformId = String(params?.id || "").trim();

    const [pageLoading, setPageLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const [platform, setPlatform] = useState(PLATFORM_DEFAULT);

    // ✅ Fields artık opsiyonel
    const [fields, setFields] = useState([]);

    // ✅ Plans
    const [plans, setPlans] = useState([]);

    const inputRef = useRef(null);
    const [fileName, setFileName] = useState("");

    const logoPreviewUrl = useMemo(() => {
        if (platform.logoFile) return URL.createObjectURL(platform.logoFile);
        if (platform.logoUrl) return toAbsoluteUrl(platform.logoUrl);
        return "";
    }, [platform.logoFile, platform.logoUrl]);

    function setPlatformField(field) {
        return (arg) => {
            const value = arg?.target ? arg.target.value : arg;
            setPlatform((prev) => ({ ...prev, [field]: value }));
        };
    }

    function onPickLogoClick() {
        inputRef.current?.click();
    }

    function onLogoFileChange(e) {
        const file = e.target.files?.[0] || null;
        setFileName(file ? file.name : "");
        setPlatform((prev) => ({ ...prev, logoFile: file }));
    }

    function onRemoveLogo() {
        setFileName("");
        setPlatform((prev) => ({ ...prev, logoFile: null, logoUrl: "" }));
        if (inputRef.current) inputRef.current.value = "";
    }

    // ----------------------------
    // Fields (optional)
    // ----------------------------
    function addField() {
        setFields((prev) => [...prev, makeField()]);
    }
    function removeField(index) {
        setFields((prev) => prev.filter((_, i) => i !== index));
    }
    function updateField(index, patch) {
        setFields((prev) => prev.map((f, i) => (i === index ? { ...f, ...patch } : f)));
    }

    function addOption(fieldIndex) {
        setFields((prev) =>
            prev.map((f, i) => {
                if (i !== fieldIndex) return f;
                return { ...f, options: [...(f.options || []), { label: "", value: "" }] };
            })
        );
    }
    function removeOption(fieldIndex, optIndex) {
        setFields((prev) =>
            prev.map((f, i) => {
                if (i !== fieldIndex) return f;
                return { ...f, options: (f.options || []).filter((_, j) => j !== optIndex) };
            })
        );
    }
    function updateOption(fieldIndex, optIndex, patch) {
        setFields((prev) =>
            prev.map((f, i) => {
                if (i !== fieldIndex) return f;
                const options = (f.options || []).map((o, j) => (j === optIndex ? { ...o, ...patch } : o));
                return { ...f, options };
            })
        );
    }

    // ----------------------------
    // Plans
    // ----------------------------
    function addPlan() {
        setPlans((prev) => [...prev, makePlan()]);
    }

    function removePlan(index) {
        setPlans((prev) => prev.filter((_, i) => i !== index));
    }

    function updatePlan(index, patch) {
        setPlans((prev) => prev.map((p, i) => (i === index ? { ...p, ...patch } : p)));
    }

    function validate() {
        if (!platform.name.trim()) return "Platform name zorunludur.";

        // ✅ Plans validation (opsiyonel)
        const cleanedPlans = plans
            .map((p) => ({
                name: normalizePlanName(p?.name),
                isActive: !!p?.isActive,
            }))
            .filter((p) => p.name);

        const planNameSet = new Set();
        for (let i = 0; i < cleanedPlans.length; i++) {
            const row = i + 1;
            const key = cleanedPlans[i].name.toLowerCase();
            if (planNameSet.has(key)) return `Plan #${row}: plan adı benzersiz olmalıdır.`;
            planNameSet.add(key);
        }

        // ✅ Fields validation (opsiyonel)
        const cleanedFields = fields
            .map((f) => ({
                ...f,
                key: normalizeKey(f?.key),
                label: String(f?.label || "").trim(),
                type: String(f?.type || "").trim(),
                required: !!f?.required,
                options: Array.isArray(f?.options) ? f.options : [],
            }))
            .filter((f) => {
                const hasAny =
                    !!f.key || !!f.label || !!f.type || (Array.isArray(f.options) && f.options.length > 0) || f.required;
                return hasAny;
            });

        const keys = new Set();
        for (let i = 0; i < cleanedFields.length; i++) {
            const f = cleanedFields[i];
            const row = i + 1;

            if (!f.key) return `Field #${row}: key zorunludur.`;
            if (keys.has(f.key)) return `Field #${row}: key benzersiz olmalıdır.`;
            keys.add(f.key);

            if (!f.label) return `Field #${row}: label zorunludur.`;
            if (!f.type) return `Field #${row}: type zorunludur.`;

            if (isOptionType(f.type)) {
                if (!f.options || f.options.length === 0) {
                    return `Field #${row}: seçenek (option) eklemelisin.`;
                }

                const values = new Set();
                for (let j = 0; j < f.options.length; j++) {
                    const opt = f.options[j];
                    const optRow = j + 1;

                    const optLabel = String(opt?.label || "").trim();
                    const optValue = String(opt?.value || "").trim();

                    if (!optLabel) return `Field #${row} Option #${optRow}: label zorunludur.`;
                    if (!optValue) return `Field #${row} Option #${optRow}: value zorunludur.`;
                    if (values.has(optValue)) return `Field #${row}: option value benzersiz olmalıdır.`;
                    values.add(optValue);
                }
            }
        }

        return "";
    }

    // ✅ GET /admin/platforms/:id
    useEffect(() => {
        if (authLoading) return;

        if (!platformId) {
            setError("Geçersiz platform id.");
            setPageLoading(false);
            return;
        }

        async function fetchPlatform() {
            try {
                setPageLoading(true);
                setError("");

                const res = await api.get(`/admin/platforms/${platformId}`);
                const p = res.data?.platform;

                if (!p) {
                    setError("Platform bulunamadı.");
                    return;
                }

                setPlatform({
                    name: p.name || "",
                    slug: p.slug || "",
                    description: p.description || "",
                    websiteUrl: p.websiteUrl || "",
                    status: p.status || "ACTIVE",
                    logoUrl: p.logoUrl || "",
                    logoFile: null,
                });

                // ✅ Plans
                const mappedPlans = (p.plans || []).map((pl) => ({
                    name: pl?.name || "",
                    isActive: !!pl?.isActive,
                }));
                setPlans(mappedPlans);

                // ✅ Fields: optionsJson -> options (opsiyonel)
                const mappedFields = (p.fields || []).map((f) => ({
                    key: f.key || "",
                    label: f.label || "",
                    type: f.type || "TEXT",
                    required: !!f.required,
                    options: Array.isArray(f.optionsJson) ? f.optionsJson : [],
                }));

                setFields(mappedFields); // boş olabilir
            } catch (err) {
                console.error(err);
                setError(err?.response?.data?.message || "Platform verisi alınırken hata oluştu.");
            } finally {
                setPageLoading(false);
            }
        }

        fetchPlatform();
    }, [authLoading, platformId]);

    // ✅ PATCH /admin/platforms/:id
    async function handleSubmit(e) {
        e.preventDefault();
        setError("");

        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }

        setSubmitting(true);

        try {
            let logoUrl = platform.logoUrl || "";
            if (platform.logoFile) {
                logoUrl = await uploadPlatformLogo(platform.logoFile);
            }

            const platformPayload = {
                name: platform.name.trim(),
                slug: platform.slug.trim() || undefined,
                description: platform.description.trim() || undefined,
                websiteUrl: platform.websiteUrl.trim() || undefined,
                status: platform.status,
                logoUrl: logoUrl || undefined,
            };

            // ✅ Plans payload (boş adları gönderme)
            const plansPayload = plans
                .map((p, idx) => ({
                    name: normalizePlanName(p?.name),
                    isActive: !!p?.isActive,
                    order: idx + 1,
                }))
                .filter((p) => p.name);

            // ✅ Fields payload (boş/yarım satırları gönderme)
            const cleanedFields = fields
                .map((f) => ({
                    ...f,
                    key: normalizeKey(f?.key),
                    label: String(f?.label || "").trim(),
                    type: String(f?.type || "").trim(),
                    required: !!f?.required,
                    options: Array.isArray(f?.options) ? f.options : [],
                }))
                .filter((f) => {
                    const hasAny =
                        !!f.key || !!f.label || !!f.type || (Array.isArray(f.options) && f.options.length > 0) || f.required;
                    return hasAny;
                });

            const fieldsPayload = cleanedFields.map((f, idx) => {
                const base = {
                    key: f.key,
                    label: f.label,
                    type: f.type,
                    required: !!f.required,
                    order: idx + 1,
                };

                if (isOptionType(f.type)) {
                    return {
                        ...base,
                        optionsJson: (f.options || []).map((o) => ({
                            label: String(o.label || "").trim(),
                            value: String(o.value || "").trim(),
                        })),
                    };
                }

                return { ...base, optionsJson: null };
            });

            await api.patch(`/admin/platforms/${platformId}`, {
                platform: platformPayload,
                plans: plansPayload,     // ✅ new
                fields: fieldsPayload,   // ✅ optional
            });

            router.replace("/admin/platforms");
        } catch (err) {
            console.error(err);
            setError(err?.response?.data?.message || "Platform güncellenirken hata oluştu.");
        } finally {
            setSubmitting(false);
        }
    }

    if (authLoading || pageLoading) {
        return (
            <main className="flex items-center justify-center h-screen text-smoke">
                <LoadingSpinner />
            </main>
        );
    }

    return (
        <main className="text-smoke">
            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <Link
                        href="/admin/platforms"
                        className="inline-flex items-center gap-2 text-silver hover:text-smoke"
                    >
                        <ArrowLeft size={18} />
                        Back to Platforms
                    </Link>

                    <BorderButton text={submitting ? "Saving..." : "Save Changes"} disabled={submitting} />
                </div>

                {error && (
                    <p className="px-4 py-2 rounded-xl border border-wrong/40 text-sm text-wrong">
                        {error}
                    </p>
                )}

                <PlatformInfoForm
                    platform={platform}
                    setPlatformField={setPlatformField}
                    logoPreviewUrl={logoPreviewUrl}
                    inputRef={inputRef}
                    fileName={fileName}
                    onPickLogoClick={onPickLogoClick}
                    onLogoInputChange={onLogoFileChange}
                    onRemoveLogo={onRemoveLogo}
                />

                {/* ✅ Plans Section */}
                <section className="rounded-3xl border border-jet p-6 space-y-4">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <h2 className="text-lg font-semibold">Plans</h2>
                            <p className="text-sm text-silver">
                                Bu platform için plan seçenekleri (opsiyonel). Plan eklenirse kullanıcı abonelikte plan seçmek zorunda olabilir.
                            </p>
                        </div>

                        <BorderButton
                            type="button"
                            text="Add Plan"
                            icon={<Plus size={16} strokeWidth={3} />}
                            onClick={addPlan}
                        />
                    </div>

                    {plans.length === 0 ? (
                        <p className="text-sm text-silver border border-jet rounded-xl px-4 py-6 text-center">
                            Henüz plan yok. İstersen plan ekleyebilirsin.
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {plans.map((p, idx) => (
                                <div key={idx} className="rounded-2xl border border-jet p-4 space-y-3">
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="text-sm text-silver">Plan #{idx + 1}</p>

                                        <button
                                            type="button"
                                            onClick={() => removePlan(idx)}
                                            className="px-3 py-2 rounded-full border border-jet hover:bg-jet transition text-wrong"
                                            title="Remove plan"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                                        <input
                                            value={p.name}
                                            onChange={(e) => updatePlan(idx, { name: e.target.value })}
                                            placeholder="Plan name (e.g. Premium)"
                                            className="w-full px-4 py-2 rounded-full border border-jet bg-night text-sm outline-none md:col-span-2"
                                        />

                                        <label className="inline-flex items-center gap-2 text-sm text-silver">
                                            <input
                                                type="checkbox"
                                                checked={!!p.isActive}
                                                onChange={(e) => updatePlan(idx, { isActive: e.target.checked })}
                                                className="accent-info"
                                            />
                                            Active
                                        </label>
                                    </div>

                                    <p className="text-xs text-silver">
                                        Not: Varsayılan olarak Active kapalıdır. Hazır olduğunda aktif edebilirsin.
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Fields (optional) */}
                <PlatformFieldsBuilder
                    fields={fields}
                    normalizeKey={normalizeKey}
                    onAddField={addField}
                    onRemoveField={removeField}
                    onUpdateField={updateField}
                    onAddOption={addOption}
                    onUpdateOption={updateOption}
                    onRemoveOption={removeOption}
                />

                <div className="flex justify-end">
                    <BorderButton text={submitting ? "Saving..." : "Save Changes"} disabled={submitting} />
                </div>
            </form>
        </main>
    );
}
