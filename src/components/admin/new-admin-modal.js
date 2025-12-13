"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import api from "@/lib/api";
import BorderButton from "@/components/buttons/border-button";
import FormInput from "@/components/inputs/input";
import PasswordInput from "@/components/inputs/password";

export default function NewAdminModal({ open, onClose, onCreated }) {
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        name: "",
        surname: "",
        email: "",
        password: "",
    });

    useEffect(() => {
        if (!open) {
            setForm({ name: "", surname: "", email: "", password: "" });
            setError("");
            setSubmitting(false);
        }
    }, [open]);

    if (!open) return null;

    function handleChange(field) {
        return (e) => {
            setForm((prev) => ({ ...prev, [field]: e.target.value }));
        };
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setSubmitting(true);

        try {
            const res = await api.post("/admin/users", {
                name: form.name,
                surname: form.surname,
                email: form.email,
                password: form.password,
            });

            if (onCreated) onCreated(res.data.user);
            onClose();
        } catch (err) {
            console.error("Create admin error:", err);
            const message = err?.response?.data?.message || "Admin oluşturulurken bir hata oluştu.";
            setError(message);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="flex justify-center items-center fixed inset-0 z-50 bg-black/60">
            <div className="w-full sm:w-1/2 p-10 rounded-2xl border border-jet bg-night space-y-7">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold">New Admin</h2>
                    <X size={20} strokeWidth={3} onClick={onClose} className="text-sm text-silver hover:text-wrong cursor-pointer" />
                </div>
                <form className="space-y-5" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2 gap-3">
                        <FormInput
                            type="text"
                            placeholder="name"
                            value={form.name}
                            onChange={handleChange("name")}
                        />
                        <FormInput
                            type="text"
                            placeholder="surname"
                            value={form.surname}
                            onChange={handleChange("surname")}
                        />
                    </div>
                    <FormInput
                        type="email"
                        placeholder="email"
                        value={form.email}
                        onChange={handleChange("email")}
                    />
                    <PasswordInput
                        value={form.password}
                        onChange={handleChange("password")}
                    />

                    {error && (
                        <p className="text-sm text-wrong font-light">{error}</p>
                    )}

                    <div className="flex justify-end">
                        <BorderButton
                            text={submitting ? "Creating..." : "Create Admin"}
                            className="font-semibold cursor-pointer"
                            disabled={submitting}
                        />
                    </div>
                </form>
            </div>
        </div>
    );
}
