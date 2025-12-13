"use client"

import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { useRequireAdmin } from "@/hooks/useRequireAdmin";
import api from "@/lib/api";
import LoadingSpinner from "@/components/loading-spinner";
import UsersTable from "@/components/admin/users-table";

export default function AdminUsersPage() {
    const { loading: authLoading, user: adminUser } = useRequireAdmin();
    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (authLoading) return;

        async function fetchUsers() {
            try {
                setLoadingUsers(true);
                setError("");
                const res = await api.get("/admin/users");
                const allUsers = res.data.users || [];
                const normalUsers = allUsers.filter((u) => u.role !== "ADMIN");
                setUsers(normalUsers);
            } catch (err) {
                console.error(err);
                const message = err?.response?.data?.message || "Kullanıcılar alınırken bir hata oluştu.";
                setError(message);
            } finally {
                setLoadingUsers(false);
            }
        }

        fetchUsers();
    }, [authLoading]);

    if (authLoading) {
        return (
            <main className="flex justify-center items-center h-screen text-smoke">
                <LoadingSpinner />
            </main>
        );
    }

    return (
        <main className="text-smoke">
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold">
                        <Users className="inline mb-1 mr-2" />
                        <span>Users</span>
                    </h1>
                    <p className="text-sm text-silver">
                        Admin:{" "}
                        {adminUser
                            ? `${adminUser.name} ${adminUser.surname}`.trim()
                            : ""}{" "}
                        ({adminUser?.email})
                    </p>
                </div>
                {error && (
                    <p className=" px-4 py-2 rounded-xl border border-wrong/40 text-sm text-wrong">
                        {error}
                    </p>
                )}
                {loadingUsers ? (
                    <div className="flex justify-center py-10">
                        <LoadingSpinner />
                    </div>
                ) : users.length === 0 ? (
                    <p className="px-4 py-6 rounded-xl border border-jet text-sm text-center text-silver">
                        Normal kullanıcı bulunamadı.
                    </p>
                ) : (
                    <UsersTable users={users} />
                )}
            </div>
        </main>
    );
}
