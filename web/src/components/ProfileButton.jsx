"use client";

import { User } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function ProfileButton() {

    const { logout } = useAuth();

    return (
        <div className="relative group">
            <button className="w-10 h-10 rounded-full overflow-hidden bg-[#000000] border-2 border-solid flex items-center justify-center">
                <User className="w-6 h-6 text-gray-300" />
            </button>
            <div className="hidden group-hover:block absolute right-0 mt-2 w-48 rounded-md border border-gray-800 bg-black/90 backdrop-blur supports-[backdrop-filter]:bg-black/60 shadow-lg z-50">
                <div className="py-2">
                    <Link
                        href="/profil"
                        className="block px-3 py-2 text-sm text-gray-200 hover:bg-gray-800/70"
                    >
                        Mon profil
                    </Link>
                    <button
                        onClick={logout}
                        className="w-full text-left px-3 py-2 text-sm text-red-300 hover:bg-red-500/20"
                    >
                        Déconnexion
                    </button>
                </div>
            </div>
        </div>
    )
}