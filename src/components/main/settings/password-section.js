"use client";

import BorderButton from "@/components/buttons/border-button";
import PasswordInput from "@/components/inputs/password";

export default function PasswordSection({ pw, saving, onChange, onSubmit }) {
    return (
        <section className="px-3 py-4 md:p-6 rounded-3xl border border-jet space-y-4">
            <h2 className="text-lg font-semibold">Password</h2>

            <PasswordInput
                placeholder="current password"
                value={pw.currentPassword}
                onChange={(e) => onChange("currentPassword", e.target.value)}
            />
            <PasswordInput
                placeholder="new password"
                value={pw.newPassword}
                onChange={(e) => onChange("newPassword", e.target.value)}
            />
            <PasswordInput
                placeholder="confirm new password"
                value={pw.confirm}
                onChange={(e) => onChange("confirm", e.target.value)}
            />

            <p className="text-xs text-silver">
                For better security, your new password should be at least 6 characters long.
            </p>

            <div className="flex justify-end">
                <BorderButton
                    text={saving ? "Updating..." : "Update Password"}
                    disabled={saving}
                    onClick={onSubmit}
                />
            </div>
        </section>
    );
}
