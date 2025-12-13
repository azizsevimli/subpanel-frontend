"use client"

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import Logo from "@/components/logo";
import HeaderDropdown from "../header-dropdown";

export default function AdminHeader() {
    const { user, logout } = useAuth();

    return (
        <header className="flex justify-between items-center w-full px-10 py-4 border-b-2 border-jet text-smoke bg-night">
            <Link href="/admin/dashboard" className="flex items-center gap-2">
                <Logo admin={true} />
            </Link>
            <HeaderDropdown user={user} logout={logout} admin={true} />
        </header>
    );
}
