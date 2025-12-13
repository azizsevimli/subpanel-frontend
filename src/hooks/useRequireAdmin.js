"use client"

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export function useRequireAdmin() {
    const router = useRouter();
    const { user, isAuthenticated, initialLoading } = useAuth();

    useEffect(() => {
        if (initialLoading) return;

        if (!isAuthenticated || user?.role !== "ADMIN") {
            router.replace("/admin-login");
        }
    }, [initialLoading, isAuthenticated, user, router]);

    const loading =
        initialLoading ||
        (!initialLoading && (!isAuthenticated || user?.role !== "ADMIN"));

    return { loading, user };
}
