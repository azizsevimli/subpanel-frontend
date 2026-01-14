"use client";

import BorderButton from "@/components/buttons/border-button";
import FormInput from "@/components/inputs/input";
import PasswordInput from "@/components/inputs/password";

export default function ProfileSection({
    profile,
    emailChanged,
    saving,
    onChange,
    onSave,
}) {
    return (
        <section className="px-3 py-4 md:p-6 rounded-3xl border border-jet space-y-4">
            <h2 className="text-lg font-semibold">Profile</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                    type="text"
                    placeholder="name"
                    value={profile.name}
                    onChange={(e) => onChange("name", e.target.value)}
                />
                <FormInput
                    type="text"
                    placeholder="surname"
                    value={profile.surname}
                    onChange={(e) => onChange("surname", e.target.value)}
                />
            </div>

            <FormInput
                type="email"
                placeholder="email"
                value={profile.email}
                onChange={(e) => onChange("email", e.target.value)}
            />

            {emailChanged ? (
                <div className="space-y-2">
                    <p className="text-xs text-silver">
                        For security, please confirm your current password before changing your email.
                    </p>
                    <PasswordInput
                        placeholder="current password (required)"
                        value={profile.currentPassword}
                        onChange={(e) => onChange("currentPassword", e.target.value)}
                    />
                </div>
            ) : null}

            <div className="flex justify-end">
                <BorderButton
                    text={saving ? "Saving..." : "Save Profile"}
                    disabled={saving}
                    onClick={onSave}
                />
            </div>
        </section>
    );
}
