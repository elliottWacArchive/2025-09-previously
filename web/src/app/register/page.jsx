"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import DotPattern from "@/components/ui/dot-pattern";
import { useAuth } from "@/contexts/AuthContext";

export default function RegisterPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        username: "",
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [errors, setErrors] = useState({});

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.username.trim()) {
            newErrors.username = "Le nom d'utilisateur est requis";
        }

        if (!formData.firstName.trim()) {
            newErrors.firstName = "Le prénom est requis";
        }

        if (!formData.lastName.trim()) {
            newErrors.lastName = "Le nom est requis";
        }

        if (!formData.email.trim()) {
            newErrors.email = "L'email est requis";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "L'email n'est pas valide";
        }

        if (!formData.password) {
            newErrors.password = "Le mot de passe est requis";
        } else if (formData.password.length < 6) {
            newErrors.password =
                "Le mot de passe doit contenir au moins 6 caractères";
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword =
                "Les mots de passe ne correspondent pas";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const [apiError, setApiError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setApiError("");
        setSuccess(false);

        if (validateForm()) {
            try {
                const res = await fetch("http://localhost:8080/register", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                });
                if (res.ok) {
                    try {
                        const loginRes = await fetch(
                            "http://localhost:8080/login",
                            {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                },
                                body: JSON.stringify({
                                    email: formData.email,
                                    password: formData.password,
                                }),
                            }
                        );

                        if (loginRes.ok) {
                            const loginData = await loginRes.json();
                            login(loginData.token, {
                                email: formData.email,
                                username: formData.username,
                                name: `${formData.firstName} ${formData.lastName}`,
                            });
                            router.push("/home");
                        } else {
                            setSuccess(true);
                        }
                    } catch (loginErr) {
                        setSuccess(true);
                    }
                } else {
                    const data = await res.json();
                    setApiError(data.message || "Erreur lors de l'inscription");
                }
            } catch (err) {
                setApiError("Erreur réseau");
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="w-full max-w-md bg-black border-gray-800">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-white text-center">
                        Inscription
                    </CardTitle>
                    <CardDescription className="text-gray-400 text-center">
                        Créez votre compte pour commencer
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {apiError && (
                            <p className="text-red-400 text-center text-sm mb-2">
                                {apiError}
                            </p>
                        )}
                        {success && (
                            <p className="text-green-400 text-center text-sm mb-2">
                                Inscription réussie !
                            </p>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="username" className="text-white">
                                Nom d'utilisateur
                            </Label>
                            <Input
                                id="username"
                                name="username"
                                type="text"
                                placeholder="Nom d'utilisateur"
                                value={formData.username}
                                onChange={handleInputChange}
                                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-white"
                            />
                            {errors.username && (
                                <p className="text-red-400 text-xs">
                                    {errors.username}
                                </p>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="firstName"
                                    className="text-white"
                                >
                                    Prénom
                                </Label>
                                <Input
                                    id="firstName"
                                    name="firstName"
                                    type="text"
                                    placeholder="Prénom"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-white"
                                />
                                {errors.firstName && (
                                    <p className="text-red-400 text-xs">
                                        {errors.firstName}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label
                                    htmlFor="lastName"
                                    className="text-white"
                                >
                                    Nom
                                </Label>
                                <Input
                                    id="lastName"
                                    name="lastName"
                                    type="text"
                                    placeholder="Nom"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-white"
                                />
                                {errors.lastName && (
                                    <p className="text-red-400 text-xs">
                                        {errors.lastName}
                                    </p>
                                )}
                            </div>
                        </div>

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
                                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-white"
                            />
                            {errors.email && (
                                <p className="text-red-400 text-xs">
                                    {errors.email}
                                </p>
                            )}
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
                                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-white"
                            />
                            {errors.password && (
                                <p className="text-red-400 text-xs">
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label
                                htmlFor="confirmPassword"
                                className="text-white"
                            >
                                Confirmer le mot de passe
                            </Label>
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-white"
                            />
                            {errors.confirmPassword && (
                                <p className="text-red-400 text-xs">
                                    {errors.confirmPassword}
                                </p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-white text-black hover:bg-gray-200 font-medium"
                        >
                            Créer un compte
                        </Button>
                    </form>

                    <div className="text-center text-sm text-gray-400">
                        Déjà un compte ?{" "}
                        <Link
                            href="/login"
                            className="text-white hover:underline font-medium"
                        >
                            Se connecter
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
