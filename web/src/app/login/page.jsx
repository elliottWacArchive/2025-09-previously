"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const [apiError, setApiError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError("");

        try {
            const res = await fetch("http://localhost:8080/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                const data = await res.json();

                try {
                    const payload = JSON.parse(atob(data.token.split(".")[1]));
                    login(data.token, {
                        email: payload.email,
                        userId: payload.userId,
                    });
                } catch (tokenErr) {
                    login(data.token, {
                        email: formData.email,
                    });
                }
                router.push("/home");
            } else {
                const errorData = await res.json();
                setApiError(errorData.message || "Erreur de connexion");
            }
        } catch (err) {
            setApiError("Erreur réseau");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="w-full max-w-md bg-black border-gray-800">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-white text-center">
                        Connexion
                    </CardTitle>
                    <CardDescription className="text-gray-400 text-center">
                        Connectez-vous à votre compte
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {apiError && (
                            <p className="text-red-400 text-center text-sm mb-2">
                                {apiError}
                            </p>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-white">
                                Email
                            </Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="votre@email.com"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-white">
                                Mot de passe
                            </Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleInputChange}
                                required
                                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-white"
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full bg-white text-black hover:bg-gray-200 font-medium"
                        >
                            Se connecter
                        </Button>
                    </form>

                    <div className="text-center text-sm text-gray-400">
                        Pas encore de compte ?{" "}
                        <Link
                            href="/register"
                            className="text-white hover:underline font-medium"
                        >
                            Créer un compte
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
