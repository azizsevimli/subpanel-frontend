"use client";

import { Plus, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FormInput from "@/components/inputs/input";
import PlatformFieldOptionRow from "@/components/admin/platforms/platform-field-option-row";

function isOptionType(type) {
    return type === "SELECT" || type === "MULTISELECT";
}

export default function PlatformFieldCard({
    field,
    index,
    canRemove,
    onRemove,
    onUpdate,
    normalizeKey,
    onAddOption,
    onUpdateOption,
    onRemoveOption,
}) {
    const fieldNumber = index + 1;
    const optionEnabled = isOptionType(field.type);

    return (
        <div className="border border-jet rounded-3xl p-5 space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold">Field #{fieldNumber}</h3>

                <button
                    type="button"
                    onClick={onRemove}
                    className="inline-flex items-center gap-2 text-wrong hover:opacity-90"
                    disabled={!canRemove}
                    title={!canRemove ? "En az 1 field olmalı" : "Remove"}
                >
                    <Trash2 size={16} />
                    Remove
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                    type="text"
                    placeholder="key (e.g. username)"
                    value={field.key}
                    onChange={(e) => onUpdate({ key: e.target.value })}
                    onBlur={() => onUpdate({ key: normalizeKey(field.key) })}
                />
                <FormInput
                    type="text"
                    placeholder="label (e.g. Username)"
                    value={field.label}
                    onChange={(e) => onUpdate({ label: e.target.value })}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <Select
                    value={field.type}
                    onValueChange={(nextType) => {
                        onUpdate({
                            type: nextType,
                            options: isOptionType(nextType) ? (field.options || []) : [],
                        });
                    }}
                >
                    <SelectTrigger className="w-full h-[35px] pl-3 rounded-[15px] border border-jet bg-smoke text-night text-sm">
                        <SelectValue placeholder="Type seç" />
                    </SelectTrigger>

                    <SelectContent className="mt-10 rounded-[15px] border border-jet bg-night text-smoke">
                        <SelectItem value="TEXT">Text</SelectItem>
                        <SelectItem value="NUMBER">Number</SelectItem>
                        <SelectItem value="EMAIL">Email</SelectItem>
                        <SelectItem value="PASSWORD">Password</SelectItem>
                        <SelectItem value="TEXTAREA">Textarea</SelectItem>
                        <SelectItem value="DATE">Date</SelectItem>
                        <SelectItem value="SELECT">Select</SelectItem>
                        <SelectItem value="MULTISELECT">Multiselect</SelectItem>
                        <SelectItem value="CHECKBOX">Checkbox</SelectItem>
                    </SelectContent>
                </Select>

                <label className="flex items-center gap-2 text-sm text-silver">
                    <input
                        type="checkbox"
                        checked={!!field.required}
                        onChange={(e) => onUpdate({ required: e.target.checked })}
                    />
                    Required
                </label>

                <div className="text-sm text-silver">
                    Order: <span className="text-smoke">{fieldNumber}</span>
                </div>
            </div>

            {optionEnabled && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-silver">Options</p>
                        <button
                            type="button"
                            onClick={onAddOption}
                            className="inline-flex items-center gap-2 text-info underline"
                        >
                            <Plus size={16} />
                            Add option
                        </button>
                    </div>

                    {(field.options || []).length === 0 ? (
                        <p className="text-xs text-silver">
                            No options yet. Add at least one option.
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {(field.options || []).map((opt, optIndex) => (
                                <PlatformFieldOptionRow
                                    key={optIndex}
                                    option={opt}
                                    onChange={(patch) => onUpdateOption(optIndex, patch)}
                                    onRemove={() => onRemoveOption(optIndex)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
