"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

import Logo from "@/components/logo";

export default function Footer() {
    const pathname = usePathname();
    const year = new Date().getFullYear();

    return (
        <footer className="w-full border-t border-jet text-smoke">
            <div className="mx-auto max-w-6xl px-6 py-10">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div className="space-y-2">
                        <Logo />
                        <p className="text-sm text-silver">
                            Track subscriptions, renewals, and costs in one place.
                        </p>
                    </div>

                    {pathname == "/" ? null : (
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 text-sm">
                            <Link href="/dashboard" className="text-silver hover:text-smoke transition">Dashboard</Link>
                            <Link href="/my-subscriptions" className="text-silver hover:text-smoke transition">My Subscriptions</Link>
                            <Link href="/calendar" className="text-silver hover:text-smoke transition">Calendar</Link>
                            <Link href="/settings" className="text-silver hover:text-smoke transition">Settings</Link>
                        </div>
                    )}
                </div>

                <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <p className="text-xs text-silver">© {year} Subpanel</p>
                    <p className="text-xs text-silver">Built for subscription tracking</p>
                </div>
            </div>
        </footer>
    );
}
