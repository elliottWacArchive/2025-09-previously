import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <main className="text-center space-y-8">
                <div className="space-y-4">
                    <h1 className="text-4xl font-bold text-white">
                        Previously On
                    </h1>
                    <p className="text-gray-400 text-lg max-w-md mx-auto">
                        Découvrez et suivez vos films et séries préférés
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
            </main>
        </div>
    );
}
