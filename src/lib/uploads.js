import api, { API_BASE_URL } from "./api";

// /uploads/... gibi relative path gelirse browser'da görünecek tam URL üretmek için
export function toAbsoluteUrl(url) {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return `${API_BASE_URL.replace(/\/api$/, "")}${url}`;
}

// 1. adım: logo upload
export async function uploadPlatformLogo(file) {
    const formData = new FormData();
    formData.append("logo", file);

    const res = await api.post("/admin/uploads/logo", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

    return res.data.logoUrl; // örn: "/uploads/logos/123.png"
}
