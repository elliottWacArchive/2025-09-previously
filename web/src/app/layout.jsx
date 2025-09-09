import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import DotPattern from "@/components/ui/dot-pattern";
import { AuthProvider } from "@/contexts/AuthContext";
import { WatchlistProvider } from "@/contexts/WatchlistContext";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata = {
    title: "Previously On",
    description: "Découvrez et suivez vos films et séries préférés",
};

export default function RootLayout({ children }) {
    return (
        <html lang="fr" className="dark">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased relative`}
            >
                <DotPattern />
                <div className="relative z-10">
                    <AuthProvider>
                        <WatchlistProvider>{children}</WatchlistProvider>
                    </AuthProvider>
                </div>
            </body>
        </html>
    );
}
