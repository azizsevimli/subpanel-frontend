"use client"

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import Logo from "@/components/logo";
import Button from "@/components/buttons/button";
import BorderButton from "@/components/buttons/border-button";
import HeaderDropdown from "./header-dropdown";

export default function Header() {
    const router = useRouter();
    const { user, isAuthenticated, logout, initialLoading } = useAuth();

    return (
        <header className="flex justify-between items-center w-full px-10 py-5 border-b-2 border-eerie text-smoke">
            <Link href={isAuthenticated ? "/dashboard" : "/"}>
                <Logo />
            </Link>
            <div>
                {initialLoading ? (
                    <div className="w-24 h-8 rounded-full bg-jet animate-pulse" />
                ) : (
                    <>
                        {!isAuthenticated ? (
                            <div className="flex items-center gap-3">
                                <BorderButton
                                    text="Login"
                                    onClick={() => { router.push("/login"); }}
                                />
                                <Button
                                    text="Sign Up"
                                    onClick={() => { router.push("/signup"); }}
                                />
                            </div>
                        ) : (
                            <HeaderDropdown user={user} logout={logout} />
                        )}
                    </>
                )}
            </div>
        </header>
    );
}
