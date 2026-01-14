"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import api, { setAuthToken, initAuthTokenFromStorage, clearAuthToken } from "@/lib/api";

const AuthContext = createContext(null);

function persistToken(token) {
    setAuthToken(token);
    if (typeof window !== "undefined") {
        localStorage.setItem("auth_token", token);
    }
}

function dropToken() {
    clearAuthToken();
    if (typeof window !== "undefined") {
        localStorage.removeItem("auth_token");
    }
}

export function AuthProvider({ children }) {
    const router = useRouter();

    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [initialLoading, setInitialLoading] = useState(true);

    useEffect(() => {
        let alive = true;

        async function initAuth() {
            try {
                if (typeof window === "undefined") return;

                const storedToken = initAuthTokenFromStorage();
                if (!storedToken) return;

                if (!alive) return;
                setToken(storedToken);

                try {
                    const res = await api.get("/me");
                    if (!alive) return;
                    setUser(res.data.user);
                    return;
                } catch (err) {
                    if (err?.response?.status !== 401) throw err;
                }

                const refreshRes = await api.post("/auth/refresh");
                const newToken = refreshRes.data?.token;

                if (newToken) {
                    persistToken(newToken);
                    if (!alive) return;
                    setToken(newToken);
                }

                if (!alive) return;
                setUser(refreshRes.data.user ?? null);
            } catch (err) {
                console.error("Init auth error:", err);
                dropToken();
                if (!alive) return;
                setUser(null);
                setToken(null);
            } finally {
                if (alive) setInitialLoading(false);
            }
        }

        initAuth();
        return () => {
            alive = false;
        };
    }, []);

    const login = useCallback(async (email, password) => {
        const res = await api.post("/auth/login", { email, password });

        const nextToken = res.data?.token;
        if (nextToken) {
            persistToken(nextToken);
            setToken(nextToken);
        }

        setUser(res.data.user);
        return res.data.user;
    }, []);

    const signup = useCallback(async ({ name, surname, email, password }) => {
        const res = await api.post("/auth/register", { name, surname, email, password });

        const nextToken = res.data?.token;
        if (nextToken) {
            persistToken(nextToken);
            setToken(nextToken);
        }

        setUser(res.data.user);
        return res.data.user;
    }, []);

    const logout = useCallback(async () => {
        try {
            await api.post("/auth/logout");
        } catch (err) {
            console.error("Logout error:", err);
        } finally {
            dropToken();
            setUser(null);
            setToken(null);
            router.replace("/login");
        }
    }, [router]);

    const value = {
        user,
        token,
        isAuthenticated: !!user,
        initialLoading,
        login,
        signup,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
