"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, LayoutGrid, Search, RefreshCw } from "lucide-react";
import { useRequireAdmin } from "@/hooks/useRequireAdmin";
import api from "@/lib/api";
import LoadingSpinner from "@/components/loading-spinner";
import BorderButton from "@/components/buttons/border-button";
import PlatformsTable from "@/components/admin/platforms-table";
import PlatformModal from "@/components/admin/platform-modal";

export default function AdminPlatformsPage() {
    const { loading: authLoading } = useRequireAdmin();

    const [items, setItems] = useState([]);
    const [meta, setMeta] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState(""); // "", "ACTIVE", "INACTIVE"
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null); // platform obj

    const query = useMemo(() => {
        const params = new URLSearchParams();
        if (search.trim()) params.set("search", search.trim());
        if (status) params.set("status", status);
        // pagination eklemek istersen:
        // params.set("page", "1"); params.set("limit", "20");
        const q = params.toString();
        return q ? `?${q}` : "";
    }, [search, status]);

    async function fetchPlatforms() {
        try {
            setLoading(true);
            setError("");
            const res = await api.get(`/admin/platforms${query}`);
            setItems(res.data.items || []);
            setMeta(res.data.meta || null);
        } catch (err) {
            console.error(err);
            setError(err?.response?.data?.message || "Platformlar alınırken hata oluştu.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (authLoading) return;
        fetchPlatforms();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authLoading, query]);

    function openCreate() {
        setEditing(null);
        setModalOpen(true);
    }

    function openEdit(platform) {
        setEditing(platform);
        setModalOpen(true);
    }

    async function handleDelete(platformId) {
        const ok = window.confirm("Bu platform silinsin mi?");
        if (!ok) return;

        try {
            setError("");
            await api.delete(`/admin/platforms/${platformId}`);
            // optimistik update:
            setItems((prev) => prev.filter((p) => p.id !== platformId));
        } catch (err) {
            console.error(err);
            setError(err?.response?.data?.message || "Platform silinirken hata oluştu.");
        }
    }

    async function handleSaved() {
        setModalOpen(false);
        setEditing(null);
        await fetchPlatforms(); // listeyi yenile
    }

    if (authLoading) {
        return (
            <main className="flex items-center justify-center h-screen text-smoke">
                <LoadingSpinner />
            </main>
        );
    }

    return (
        <main className="text-smoke">
            <div className="space-y-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold">
                            <LayoutGrid className="inline mb-1 mr-2" />
                            <span>Platforms</span>
                        </h1>
                        {meta && (
                            <p className="text-sm text-silver">
                                Total: {meta.total} | Page: {meta.page} / {meta.totalPages}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <BorderButton
                            text="Refresh"
                            icon={<RefreshCw size={16} strokeWidth={3} />}
                            onClick={fetchPlatforms}
                        />
                        <BorderButton
                            text="New Platform"
                            icon={<Plus size={16} strokeWidth={3} />}
                            onClick={openCreate}
                        />
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="flex items-center gap-2 border border-jet rounded-full px-4 py-2 w-full md:w-1/2">
                        <Search size={16} />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name or slug..."
                            className="bg-transparent outline-none w-full text-sm"
                        />
                    </div>

                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="border border-jet rounded-full px-4 py-2 bg-night text-sm w-full md:w-56"
                    >
                        <option value="">All</option>
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                    </select>
                </div>

                {error && (
                    <p className="text-sm text-wrong border border-wrong/40 rounded-xl px-4 py-2">
                        {error}
                    </p>
                )}

                {loading ? (
                    <div className="flex justify-center py-10">
                        <LoadingSpinner />
                    </div>
                ) : items.length === 0 ? (
                    <p className="text-sm text-silver border border-jet rounded-xl px-4 py-6 text-center">
                        Platform bulunamadı.
                    </p>
                ) : (
                    <PlatformsTable
                        platforms={items}
                        onEdit={openEdit}
                        onDelete={handleDelete}
                    />
                )}
            </div>

            <PlatformModal
                open={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setEditing(null);
                }}
                initialData={editing}
                onSaved={handleSaved}
            />
        </main>
    );
}
