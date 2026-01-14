"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FormInput from "@/components/inputs/input";
import ReqOptLabel from "@/components/required-optional-label";

export default function FieldPreview({ field, value, onChange }) {
    const labelRow = (
        <>
            {field.required ? <ReqOptLabel required>{field.label}</ReqOptLabel> : <ReqOptLabel optional>{field.label}</ReqOptLabel>}
        </>
    );

    switch (field.type) {
        case "TEXT":
            return (
                <div className="space-y-2">
                    {labelRow}
                    <FormInput
                        type="text"
                        placeholder={field.key}
                        value={value ?? ""}
                        onChange={(e) => onChange(e.target.value)}
                    />
                </div>
            );

        case "EMAIL":
            return (
                <div className="space-y-2">
                    {labelRow}
                    <FormInput
                        type="email"
                        placeholder={field.key}
                        value={value ?? ""}
                        onChange={(e) => onChange(e.target.value)}
                    />
                </div>
            );

        case "NUMBER":
            return (
                <div className="space-y-2">
                    {labelRow}
                    <FormInput
                        type="number"
                        placeholder={field.key}
                        value={value ?? ""}
                        onChange={(e) => onChange(e.target.value)}
                    />
                </div>
            );

        case "PASSWORD":
            return (
                <div className="space-y-2">
                    {labelRow}
                    <FormInput
                        type="password"
                        placeholder={field.key}
                        value={value ?? ""}
                        onChange={(e) => onChange(e.target.value)}
                    />
                </div>
            );

        case "TEXTAREA":
            return (
                <div className="space-y-2">
                    {labelRow}
                    <textarea
                        placeholder={field.key}
                        value={value ?? ""}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-full min-h-[110px] px-3 py-2 rounded-[15px] border border-jet outline-none bg-smoke text-sm text-night"
                    />
                </div>
            );

        case "DATE":
            return (
                <div className="space-y-2">
                    {labelRow}
                    <input
                        type="date"
                        value={value ?? ""}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-full h-[35px] px-3 rounded-[15px] border border-jet outline-none bg-smoke text-sm text-night"
                    />
                </div>
            );

        case "CHECKBOX":
            return (
                <div className="space-y-2">
                    {labelRow}
                    <label className="inline-flex items-center gap-2 text-sm text-silver">
                        <input
                            type="checkbox"
                            checked={!!value}
                            onChange={(e) => onChange(e.target.checked)}
                        />
                        {field.key}
                    </label>
                </div>
            );

        case "SELECT": {
            const options = Array.isArray(field.optionsJson) ? field.optionsJson : [];
            return (
                <div className="space-y-2">
                    {labelRow}
                    <Select value={value ?? ""} onValueChange={(v) => onChange(v)}>
                        <SelectTrigger className="w-full h-[35px] pl-3 rounded-[15px] border border-jet bg-smoke text-night text-sm">
                            <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent className="mt-10 rounded-[15px] border border-jet bg-night text-smoke">
                            {options.map((o) => (
                                <SelectItem key={o.value} value={String(o.value)}>
                                    {o.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            );
        }

        case "MULTISELECT": {
            const options = Array.isArray(field.optionsJson) ? field.optionsJson : [];
            const arr = Array.isArray(value) ? value : [];

            function toggle(val) {
                const v = String(val);
                if (arr.includes(v)) onChange(arr.filter((x) => x !== v));
                else onChange([...arr, v]);
            }

            return (
                <div className="space-y-2">
                    {labelRow}
                    <div className="rounded-2xl border border-jet p-3 space-y-2">
                        {options.map((o) => {
                            const v = String(o.value);
                            return (
                                <label key={v} className="flex items-center gap-2 text-sm text-silver">
                                    <input
                                        type="checkbox"
                                        checked={arr.includes(v)}
                                        onChange={() => toggle(v)}
                                    />
                                    <span>{o.label}</span>
                                </label>
                            );
                        })}
                    </div>
                </div>
            );
        }

        default:
            return (
                <div className="space-y-2">
                    {labelRow}
                    <p className="text-sm text-silver">Bu type için UI tanımlı değil.</p>
                </div>
            );
    }
}
