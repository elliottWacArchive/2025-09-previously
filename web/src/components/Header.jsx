"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import Searchbar from "@/components/Searchbar";
import ProfileButton from "@/components/ProfileButton";

export default function Header() {
    const { user, logout } = useAuth();
    const pathname = usePathname();

    const displayName =
        user?.login ||
        user?.username ||
        user?.name ||
        user?.email?.split("@")[0] ||
        "Utilisateur";

    const navigationItems = [
        { href: "/home", label: "Films", current: pathname === "/home" },
        { href: "/series", label: "Séries", current: pathname === "/series" },
        {
            href: "/watchlist",
            label: "Watchlist",
            current: pathname === "/watchlist",
        },
    ];

    return (
        <header className="w-full border-b border-gray-800/50 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 py-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center">
                        <Link href="/home" className="group">
                            <h1 className="text-2xl md:text-3xl font-black leading-none bg-gradient-to-r from-red-400 via-red-500 to-red-300 bg-clip-text text-transparent group-hover:from-red-300 group-hover:via-red-400 group-hover:to-red-200 transition-all duration-300">
                                Previously On
                            </h1>
                        </Link>
                    </div>

                    <nav className="hidden md:flex items-center space-x-8">
                        {navigationItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`text-sm font-medium transition-colors duration-200 hover:text-white ${
                                    item.current
                                        ? "text-white border-b-2 border-red-500 pb-1"
                                        : "text-gray-300 hover:text-white"
                                }`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-400 hidden sm:inline">
                            Salut, {displayName}
                        </span>
                        <Searchbar />
                        <ProfileButton />
                    </div>

                    <div className="md:hidden">
                        <button className="text-gray-400 hover:text-white">
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="md:hidden mt-4 pt-4 border-t border-gray-800/50">
                    <nav className="flex flex-col space-y-2">
                        {navigationItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`text-sm font-medium py-2 px-3 rounded transition-colors duration-200 ${
                                    item.current
                                        ? "text-white bg-red-500/20 border-l-4 border-red-500"
                                        : "text-gray-300 hover:text-white hover:bg-gray-800/50"
                                }`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                </div>
            </div>
        </header>
    );
}
