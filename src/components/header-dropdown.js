"use client"

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import BorderButton from "./buttons/border-button";

export default function HeaderDropdown({ user, logout, admin = false }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="relative">
            <BorderButton
                text={user?.name || user?.email}
                icon={<ChevronDown size={16} />}
                iconPosition="right"
                onClick={() => setOpen((prev) => !prev)}
            />
            {open && (
                <div className="absolute z-50 right-0 mt-2 w-48 rounded-xl border-2 border-jet bg-night shadow-lg text-sm overflow-hidden">
                    <div className="px-4 py-3 border-b border-jet">
                        <p className="font-medium truncate">{user ? `${user.name} ${user.surname}`.trim() : ""}</p>
                        <p className="text-xs text-silver truncate">
                            {user?.email}
                        </p>
                        {admin && (<p className="text-xs text-info font-semibold mt-1">Admin</p>)}
                    </div>
                    <Link
                        href={admin ? "/admin/dashboard" : "/dashboard"}
                        className="block px-4 py-2 hover:bg-jet"
                        onClick={() => setOpen(false)}
                    >
                        Dashboard
                    </Link>
                    <Link
                        href={admin ? "/admin/settings" : "/settings"}
                        className="block px-4 py-2 hover:bg-jet"
                        onClick={() => setOpen(false)}
                    >
                        Settings
                    </Link>
                    <button
                        onClick={() => {
                            setOpen(false);
                            logout();
                        }}
                        className="w-full  px-4 py-2 text-left hover:bg-jet text-wrong"
                    >
                        Log out
                    </button>
                </div>
            )}
        </div>
    );
}