"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import BorderButton from "@/components/buttons/border-button";
import FormInput from "@/components/inputs/input";

export default function PlatformInfoForm({
    platform,
    setPlatformField,
    logoPreviewUrl,
    inputRef,
    fileName,
    onPickLogoClick,
    onLogoInputChange,
    onRemoveLogo,
}) {
    return (
        <section className="p-6 rounded-3xl border border-jet space-y-4">
            <h2 className="text-lg font-semibold">Platform Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                    type="text"
                    placeholder="name"
                    value={platform.name}
                    onChange={setPlatformField("name")}
                />

                <FormInput
                    type="text"
                    placeholder="slug (optional)"
                    value={platform.slug}
                    onChange={setPlatformField("slug")}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                    type="text"
                    placeholder="websiteUrl (optional)"
                    value={platform.websiteUrl}
                    onChange={setPlatformField("websiteUrl")}
                />

                <Select
                    value={platform.status}
                    onValueChange={(value) => setPlatformField("status")(value)}
                >
                    <SelectTrigger className="w-full h-[35px] pl-3 rounded-[15px] border border-jet bg-smoke text-night text-sm">
                        <SelectValue placeholder="Status seç" />
                    </SelectTrigger>

                    <SelectContent className="mt-10 rounded-[15px] border border-jet bg-night text-smoke">
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <textarea
                value={platform.description}
                onChange={setPlatformField("description")}
                placeholder="description (optional)"
                className="w-full min-h-[110px] px-3 py-2 rounded-[15px] border border-jet outline-none bg-smoke text-sm text-night"
            />

            {/* Logo upload + preview */}
            <div className="space-y-2">
                <label className="pl-3 text-sm text-silver">Logo (optional)</label>

                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    onChange={onLogoInputChange}
                    className="hidden"
                />

                <div className="flex items-center w-full px-3 py-2 gap-5 rounded-[15px] border border-jet bg-night">
                    <BorderButton
                        type="button"
                        text="Logo seç"
                        onClick={onPickLogoClick}
                        className="text-sm"
                    />
                    <div className="min-w-0 text-sm opacity-90">
                        {fileName ? (
                            <span className="truncate block">{fileName}</span>
                        ) : (
                            <span className="opacity-60">Henüz dosya seçilmedi</span>
                        )}
                    </div>
                </div>

                {logoPreviewUrl ? (
                    <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={logoPreviewUrl}
                            alt="logo preview"
                            className="w-16 h-16 rounded-[15px] border border-jet object-cover"
                        />
                        <button
                            type="button"
                            className="underline text-sm text-wrong"
                            onClick={onRemoveLogo}
                        >
                            Remove logo
                        </button>
                    </div>
                ) : (
                    <p className="pl-3 text-xs text-silver">No logo selected.</p>
                )}
            </div>
        </section>
    );
}
