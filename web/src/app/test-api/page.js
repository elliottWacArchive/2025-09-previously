"use client";

import { useState, useEffect } from "react";

export default function TestAPI() {
    const [healthStatus, setHealthStatus] = useState("Loading...");
    const [todos, setTodos] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Test de l'endpoint health
        fetch("/api/v1/health")
            .then((response) => {
                if (response.ok) {
                    return response.text();
                }
                throw new Error("Health check failed");
            })
            .then((data) => {
                setHealthStatus(`✅ API Health: ${data}`);
            })
            .catch((err) => {
                setHealthStatus(`❌ Health check failed: ${err.message}`);
                setError(err.message);
            });

        // Test de l'endpoint todos
        fetch("/api/v1/todos")
            .then((response) => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error("Todos fetch failed");
            })
            .then((data) => {
                setTodos(data);
            })
            .catch((err) => {
                setError(err.message);
            });
    }, []);

    return (
        <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
            <h1>🧪 Test de connexion API Go ↔ Next.js</h1>

            <div
                style={{
                    marginBottom: "20px",
                    padding: "10px",
                    border: "1px solid #ccc",
                    borderRadius: "5px",
                }}
            >
                <h2>Status de l'API</h2>
                <p>{healthStatus}</p>
            </div>

            <div
                style={{
                    marginBottom: "20px",
                    padding: "10px",
                    border: "1px solid #ccc",
                    borderRadius: "5px",
                }}
            >
                <h2>Liste des Todos</h2>
                {todos.length > 0 ? (
                    <ul>
                        {todos.map((todo) => (
                            <li key={todo.id}>
                                {todo.title} -{" "}
                                {todo.done ? "✅ Done" : "⏳ Pending"}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>Aucun todo trouvé ou erreur de chargement</p>
                )}
            </div>

            {error && (
                <div
                    style={{
                        padding: "10px",
                        backgroundColor: "#ffe6e6",
                        border: "1px solid #ff0000",
                        borderRadius: "5px",
                    }}
                >
                    <h3>❌ Erreur</h3>
                    <p>{error}</p>
                </div>
            )}

            <div
                style={{
                    marginTop: "20px",
                    padding: "10px",
                    backgroundColor: "#f0f0f0",
                    borderRadius: "5px",
                }}
            >
                <h3>📋 Configuration actuelle</h3>
                <ul>
                    <li>API Go: http://localhost:8000</li>
                    <li>Next.js proxy: /api/* → http://localhost:8000/api/*</li>
                    <li>Endpoints testés:</li>
                    <ul>
                        <li>GET /api/v1/health</li>
                        <li>GET /api/v1/todos</li>
                    </ul>
                </ul>
            </div>
        </div>
    );
}
