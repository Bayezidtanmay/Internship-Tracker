import { createContext, useContext, useEffect, useState } from "react";
import { apiFetch, setToken, getToken } from "../api/client";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    async function login(email, password) {
        const data = await apiFetch("/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
        });
        setToken(data.token);
        setUser(data.user);
    }

    function logout() {
        setToken(null);
        setUser(null);
    }

    async function loadUser() {
        try {
            const data = await apiFetch("/auth/me");
            setUser(data.user);
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (getToken()) loadUser();
        else setLoading(false);
    }, []);

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
