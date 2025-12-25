"use client";

import { Trash2 } from "lucide-react";
import FormInput from "@/components/inputs/input";

export default function PlatformFieldOptionRow({ option, onChange, onRemove }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
            <FormInput
                type="text"
                placeholder="option label"
                value={option.label}
                onChange={(e) => onChange({ label: e.target.value })}
            />
            <FormInput
                type="text"
                placeholder="option value"
                value={option.value}
                onChange={(e) => onChange({ value: e.target.value })}
            />
            <button
                type="button"
                onClick={onRemove}
                className="inline-flex items-center gap-2 text-wrong hover:opacity-90 justify-start"
            >
                <Trash2 size={16} />
                Remove option
            </button>
        </div>
    );
}
