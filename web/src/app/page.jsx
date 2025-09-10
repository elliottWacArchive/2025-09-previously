import Link from "next/link";
import { Button } from "@/components/ui/button";
import LiquidEther from "@/components/LiquidEther";

export default function Home() {
    return (
        <div className="relative w-full min-h-screen flex items-center justify-center">
            <div className="absolute inset-0 z-0">
                <LiquidEther
                    colors={["#ba8cff", "#F97316", "#DC2626"]}
                    mouseForce={20}
                    cursorSize={100}
                    isViscous={true}
                    viscous={30}
                    iterationsViscous={32}
                    iterationsPoisson={32}
                    resolution={0.5}
                    isBounce={false}
                    autoDemo={true}
                    autoSpeed={0.5}
                    autoIntensity={2.5}
                    takeoverDuration={0.25}
                    autoResumeDelay={3000}
                    autoRampDuration={0.6}
                />
            </div>

            <div className="relative z-10 text-center px-6 max-w-6xl mx-auto">
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
