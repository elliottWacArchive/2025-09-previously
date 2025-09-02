import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative">
            <div className="absolute inset-0 opacity-50">
                <div className="absolute top-0 left-0 w-full h-full">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-red-500/20 to-red-500/20 rounded-full blur-3xl animate-pulse"></div>
                    <div
                        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-orange-500/20 to-orange-500/20 rounded-full blur-3xl animate-pulse"
                        style={{ animationDelay: "1s" }}
                    ></div>
                    <div
                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-purple-500/5 via-purple-500/3 to-pink-500/5 rounded-full blur-3xl animate-spin"
                        style={{ animationDuration: "30s" }}
                    ></div>
                </div>
            </div>

            <div className="z-10 text-center px-6 max-w-6xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-6xl md:text-8xl lg:text-9xl font-black mb-4 leading-none bg-gradient-to-r from-red-400 via-red-500 to-red-300 bg-clip-text text-transparent">
                        Previously On
                    </h1>
                    <p className="text-gray-400 text-lg max-w-md mx-auto mb-8">
                        Partagez vos films et séries préférés avec vos amis.
                    </p>
                </div>

                <div
                    className="flex flex-col sm:flex-row items-center justify-center gap-4 transform transition-all duration-1000"
                    style={{ transitionDelay: "1000ms" }}
                >
                    <Link href="/login">
                        <Button className="w-full sm:w-auto bg-white text-black hover:bg-gray-200 font-medium">
                            Se connecter
                        </Button>
                    </Link>
                    <Link href="/register">
                        <Button
                            variant="outline"
                            className="w-full sm:w-auto bg-transparent border-white text-white hover:bg-white hover:text-black"
                        >
                            Créer un compte
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
