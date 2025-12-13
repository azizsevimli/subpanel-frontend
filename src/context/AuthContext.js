"use client"

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const router = useRouter();

    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [initialLoading, setInitialLoading] = useState(true);

    useEffect(() => {
        if (token) {
            api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        } else {
            delete api.defaults.headers.common["Authorization"];
        }
    }, [token]);

    useEffect(() => {
        async function initAuth() {
            try {
                if (typeof window === "undefined") return;

                const storedToken = localStorage.getItem("auth_token");
                if (!storedToken) {
                    setInitialLoading(false);
                    return;
                }

                setToken(storedToken);

                try {
                    const res = await api.get("/me");
                    setUser(res.data.user);
                    setInitialLoading(false);
                    return;
                } catch (err) {
                    if (err.response?.status !== 401) {
                        throw err;
                    }
                }

                try {
                    const refreshRes = await api.post("/auth/refresh");
                    const newToken = refreshRes.data.token;

                    if (newToken) {
                        localStorage.setItem("auth_token", newToken);
                        setToken(newToken);
                    }

                    setUser(refreshRes.data.user);
                    setInitialLoading(false);
                } catch (refreshErr) {
                    localStorage.removeItem("auth_token");
                    setUser(null);
                    setToken(null);
                    setInitialLoading(false);
                }
            } catch (err) {
                console.error("Init auth error:", err);
                localStorage.removeItem("auth_token");
                setUser(null);
                setToken(null);
                setInitialLoading(false);
            }
        }

        initAuth();
    }, []);

    const login = useCallback(async (email, password) => {
        const res = await api.post("/auth/login", { email, password });

        if (res.data?.token) {
            if (typeof window !== "undefined") {
                localStorage.setItem("auth_token", res.data.token);
            }
            setToken(res.data.token);
        }

        setUser(res.data.user);
        return res.data.user;
    }, []);

    const signup = useCallback(async ({ name, surname, email, password }) => {
        const payload = {
            email,
            password,
            name,
            surname,
        };

        const res = await api.post("/auth/register", payload);

        if (res.data?.token) {
            if (typeof window !== "undefined") {
                localStorage.setItem("auth_token", res.data.token);
            }
            setToken(res.data.token);
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
            if (typeof window !== "undefined") {
                localStorage.removeItem("auth_token");
            }
            setUser(null);
            setToken(null);
            router.replace("/login");
        }
    }, [router]);

    const value = {
        user,
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
    if (!ctx) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return ctx;
}
