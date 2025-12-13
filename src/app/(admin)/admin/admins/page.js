"use client"

import { useEffect, useState } from "react";
import { Shield, Plus } from "lucide-react";
import { useRequireAdmin } from "@/hooks/useRequireAdmin";
import api from "@/lib/api";
import LoadingSpinner from "@/components/loading-spinner";
import UsersTable from "@/components/admin/users-table";
import BorderButton from "@/components/buttons/border-button";
import NewAdminModal from "@/components/admin/new-admin-modal";

export default function AdminAdminsPage() {
    const { loading: authLoading, user: adminUser } = useRequireAdmin();
    const [admins, setAdmins] = useState([]);
    const [loadingAdmins, setLoadingAdmins] = useState(true);
    const [error, setError] = useState("");
    const [newAdminOpen, setNewAdminOpen] = useState(false);

    useEffect(() => {
        if (authLoading) return;

        async function fetchAdmins() {
            try {
                setLoadingAdmins(true);
                setError("");
                const res = await api.get("/admin/users");
                const allUsers = res.data.users || [];
                const adminUsers = allUsers.filter((u) => u.role === "ADMIN");
                setAdmins(adminUsers);
            } catch (err) {
                console.error(err);
                const message = err?.response?.data?.message || "Admin kullanıcılar alınırken bir hata oluştu.";
                setError(message);
            } finally {
                setLoadingAdmins(false);
            }
        }

        fetchAdmins();
    }, [authLoading]);

    if (authLoading) {
        return (
            <main className="flex justify-center items-center h-screen text-smoke">
                <LoadingSpinner />
            </main>
        );
    }

    function handleAdminCreated(newAdmin) {
        setAdmins((prev) => [...prev, newAdmin]);
    }

    return (
        <main className="text-smoke">
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-semibold">
                            <Shield className="inline mb-1 mr-2" />
                            <span>Admins</span>
                        </h1>
                        <p className="text-sm text-silver">
                            Admin:{" "}
                            {adminUser
                                ? `${adminUser.name} ${adminUser.surname}`.trim()
                                : ""}{" "}
                            ({adminUser?.email})
                        </p>
                    </div>
                    <BorderButton
                        text="New Admin"
                        icon={<Plus size={16} strokeWidth={3} />}
                        onClick={() => setNewAdminOpen(true)}
                    />
                </div>
                {error && (
                    <p className=" px-4 py-2 rounded-xl border border-wrong/40 text-sm text-wrong">
                        {error}
                    </p>
                )}
                {loadingAdmins ? (
                    <div className="flex justify-center py-10">
                        <LoadingSpinner />
                    </div>
                ) : admins.length === 0 ? (
                    <p className="px-4 py-6 rounded-xl border border-jet text-sm text-center text-silver">
                        Admin kullanıcı bulunamadı.
                    </p>
                ) : (
                    <UsersTable users={admins} />
                )}
            </div>
            <NewAdminModal
                open={newAdminOpen}
                onClose={() => setNewAdminOpen(false)}
                onCreated={handleAdminCreated}
            />
        </main>
    );
}
