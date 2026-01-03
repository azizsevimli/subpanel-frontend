import axios from "axios";

export const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

// ✅ Normal istekler için instance
const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // refreshToken cookie gitsin
});

// ✅ Refresh isteği için ayrı instance (interceptor'lara takılmasın)
const refreshApi = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

const TOKEN_STORAGE_KEY = "auth_token";

/**
 * Token'ı axios default header'a yazar + localStorage'a kaydeder.
 */
export function setAuthToken(token) {
    if (typeof window !== "undefined") {
        if (token) localStorage.setItem(TOKEN_STORAGE_KEY, token);
        else localStorage.removeItem(TOKEN_STORAGE_KEY);
    }

    if (token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
        delete api.defaults.headers.common["Authorization"];
    }
}

/**
 * localStorage'dan token alıp axios header'a yazar (sayfa refresh sonrası için)
 */
export function initAuthTokenFromStorage() {
    if (typeof window === "undefined") return null;
    const t = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (t) {
        api.defaults.headers.common["Authorization"] = `Bearer ${t}`;
        return t;
    }
    return null;
}

/**
 * Token temizle (logout veya refresh fail durumunda)
 */
export function clearAuthToken() {
    setAuthToken(null);
}

/**
 * REFRESH QUEUE: aynı anda 5 istek 401 alırsa 5 refresh atmasın.
 */
let isRefreshing = false;
let refreshQueue = [];

function resolveQueue(error, token = null) {
    refreshQueue.forEach((p) => {
        if (error) p.reject(error);
        else p.resolve(token);
    });
    refreshQueue = [];
}

async function refreshAccessToken() {
    // Refresh endpoint: /api/auth/refresh
    const res = await refreshApi.post("/auth/refresh");
    const newToken = res.data?.token;

    if (!newToken) {
        const e = new Error("REFRESH_NO_TOKEN");
        e.code = "REFRESH_NO_TOKEN";
        throw e;
    }

    setAuthToken(newToken);
    return newToken;
}

/**
 * ✅ Response interceptor: 401 → refresh → retry
 */
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error?.config;
        const status = error?.response?.status;

        // Eğer response yoksa (network, CORS vs.) direkt fırlat
        if (!status || !originalRequest) {
            return Promise.reject(error);
        }

        // Refresh endpoint itself 401 veriyorsa retry yapma
        const isAuthRefreshCall =
            typeof originalRequest.url === "string" &&
            originalRequest.url.includes("/auth/refresh");

        // Sadece 401 için refresh dene
        if (status !== 401 || isAuthRefreshCall) {
            return Promise.reject(error);
        }

        // Bu request daha önce retry edildiyse döngüye girme
        if (originalRequest._retry) {
            return Promise.reject(error);
        }
        originalRequest._retry = true;

        // Eğer refresh zaten yapılıyorsa, kuyruğa gir
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                refreshQueue.push({
                    resolve: (token) => {
                        originalRequest.headers = originalRequest.headers || {};
                        originalRequest.headers["Authorization"] = `Bearer ${token}`;
                        resolve(api(originalRequest));
                    },
                    reject,
                });
            });
        }

        // Refresh başlat
        isRefreshing = true;

        try {
            const newToken = await refreshAccessToken();
            resolveQueue(null, newToken);
            isRefreshing = false;

            // Orijinal isteği yeni token ile tekrar gönder
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers["Authorization"] = `Bearer ${newToken}`;

            return api(originalRequest);
        } catch (refreshErr) {
            // Refresh başarısız → token temizle + queue fail
            clearAuthToken();
            resolveQueue(refreshErr, null);
            isRefreshing = false;

            // Kullanıcıyı login'e yönlendir (hook kullanamadığımız için)
            if (typeof window !== "undefined") {
                window.location.href = "/login";
            }

            return Promise.reject(refreshErr);
        }
    }
);

export default api;
