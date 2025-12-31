"use client"

import { usePathname } from "next/navigation";
import { Dot } from "lucide-react";
import Link from "next/link";

export default function Sidebar({ className = "" }) {
    const pathname = usePathname();

    const menuItems = [
        { id: 0, name: "Dashboard", href: "/dashboard" },
        { id: 1, name: "My Subscriptions", href: "/my-subscriptions" },
    ];

    return (
        <aside className={`p-3 rounded-2xl border-2 border-jet space-y-1 ${className}`}>
            {menuItems.map((item) => (
                <Link
                    key={item.id}
                    href={item.href}
                    className={`block px-6 py-4 rounded-xl hover:bg-eerie transition ${pathname === item.href ? "bg-eerie font-semibold" : "font-light"}`}
                >
                    <div className="flex justify-start items-center gap-x-1">
                        {pathname === item.href && <Dot size={24} strokeWidth={3} className="text-smoke" />}
                        {item.name}
                    </div>
                </Link>

            ))}
        </aside>
    );
}