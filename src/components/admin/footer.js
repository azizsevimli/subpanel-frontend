import Link from "next/link";
import Logo from "@/components/logo";

export default function AdminFooter() {
    const year = new Date().getFullYear();

    return (
        <footer className="w-full border-t border-jet text-smoke">
            <div className="mx-auto max-w-6xl px-6 py-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <Logo admin={true} />
                        <span className="text-xs text-silver">Admin Panel</span>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm">
                        <Link href="/admin/dashboard" className="text-silver hover:text-smoke transition">Dashboard</Link>
                        <Link href="/admin/users" className="text-silver hover:text-smoke transition">Users</Link>
                        <Link href="/admin/admins" className="text-silver hover:text-smoke transition">Admins</Link>
                        <Link href="/admin/platforms" className="text-silver hover:text-smoke transition">Platforms</Link>
                        <Link href="/admin/settings" className="text-silver hover:text-smoke transition">Settings</Link>
                    </div>
                </div>

                <div className="mt-6 text-xs text-silver">
                    © {year} Subpanel Admin • Restricted area
                </div>
            </div>
        </footer>
    );
}
