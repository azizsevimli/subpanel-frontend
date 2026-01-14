"use client";

import Logo from "@/components/logo";

export default function AuthCard({ children }) {
    return (
        <main className="flex items-center justify-center mt-20 md:mt-32 px-5 md:px-10 text-smoke">
            <div className="w-full md:w-1/2 xl:w-1/3 py-10 px-5 lg:p-10 rounded-2xl md:rounded-4xl border-2 border-jet space-y-7">
                <Logo />
                {children}
            </div>
        </main>
    );
}
