"use client";

export default function LoadingSpinner() {
    return (
        <div className="flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-silver border-t-transparent rounded-full animate-spin" />
            <p className="text-silver text-sm">Loading...</p>
        </div>
    );
}
