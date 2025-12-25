"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

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

export default function EditPlatformPage() {
    const router = useRouter();
    const params = useParams();
    const { loading: authLoading } = useRequireAdmin();

    const idParam = params?.id;
    const platformId = Number(idParam);

    const [pageLoading, setPageLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const [platform, setPlatform] = useState(PLATFORM_DEFAULT);
    const [fields, setFields] = useState([makeField()]);

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

    function validate() {
        if (!platform.name.trim()) return "Platform name zorunludur.";

        const keys = new Set();
        for (let i = 0; i < fields.length; i++) {
            const f = fields[i];
            const row = i + 1;

            const key = normalizeKey(f.key);
            if (!key) return `Field #${row}: key zorunludur.`;
            if (keys.has(key)) return `Field #${row}: key benzersiz olmalıdır.`;
            keys.add(key);

            if (!String(f.label || "").trim()) return `Field #${row}: label zorunludur.`;
            if (!String(f.type || "").trim()) return `Field #${row}: type zorunludur.`;

            if (isOptionType(f.type)) {
                if (!f.options || f.options.length === 0) {
                    return `Field #${row}: seçenek (option) eklemelisin.`;
                }
                const values = new Set();
                for (let j = 0; j < f.options.length; j++) {
                    const opt = f.options[j];
                    const optRow = j + 1;

                    if (!String(opt.label || "").trim()) return `Field #${row} Option #${optRow}: label zorunludur.`;
                    if (!String(opt.value || "").trim()) return `Field #${row} Option #${optRow}: value zorunludur.`;
                    if (values.has(opt.value.trim())) return `Field #${row}: option value benzersiz olmalıdır.`;
                    values.add(opt.value.trim());
                }
            }
        }
        return "";
    }

    // ✅ GET /admin/platforms/:id
    useEffect(() => {
        if (authLoading) return;

        if (!Number.isFinite(platformId) || platformId <= 0) {
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

                // optionsJson -> options
                const mapped = (p.fields || []).map((f) => ({
                    key: f.key || "",
                    label: f.label || "",
                    type: f.type || "TEXT",
                    required: !!f.required,
                    options: Array.isArray(f.optionsJson) ? f.optionsJson : [],
                }));

                setFields(mapped.length > 0 ? mapped : [makeField()]);
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

            const fieldsPayload = fields.map((f, idx) => {
                const key = normalizeKey(f.key);
                const base = {
                    key,
                    label: String(f.label || "").trim(),
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
                fields: fieldsPayload,
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

                    <BorderButton
                        text={submitting ? "Saving..." : "Save Changes"}
                        disabled={submitting}
                    />
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
                    <BorderButton
                        text={submitting ? "Saving..." : "Save Changes"}
                        disabled={submitting}
                    />
                </div>
            </form>
        </main>
    );
}
