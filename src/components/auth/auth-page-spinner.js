"use client";

import LoadingSpinner from "@/components/loading-spinner";

export default function AuthPageSpinner() {
    return (
        <main className="flex justify-center items-center h-[calc(100vh-80px)] text-smoke">
            <LoadingSpinner />
        </main>
    );
}
