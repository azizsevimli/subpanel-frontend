"use client"

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export function useRedirectIfAuthenticated() {
    const router = useRouter();
    const { isAuthenticated, initialLoading } = useAuth();

    useEffect(() => {
        if (initialLoading) return;
        if (isAuthenticated) {
            router.replace("/dashboard");
        }
    }, [initialLoading, isAuthenticated, router]);

    return {
        loading: initialLoading,
    };
}
