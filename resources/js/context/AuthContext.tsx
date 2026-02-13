import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";
import { User } from "../types";

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, user: User) => void;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(
        localStorage.getItem("token"),
    );
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const initAuth = async () => {
            const storedToken = localStorage.getItem("token");
            if (storedToken) {
                try {
                    api.defaults.headers.common["Authorization"] =
                        `Bearer ${storedToken}`;
                    const response = await api.get("/auth/me");
                    setUser(response.data.user);
                    setToken(storedToken);
                } catch (error) {
                    console.error("Failed to fetch user", error);
                    localStorage.removeItem("token");
                    setToken(null);
                    setUser(null);
                    delete api.defaults.headers.common["Authorization"];
                }
            }
            setIsLoading(false);
        };

        initAuth();
    }, []);

    useEffect(() => {
        if (!user) return;

        const TIMEOUT_DURATION = 2 * 60 * 60 * 1000;
        let timeoutId: ReturnType<typeof setTimeout>;

        const handleLogout = () => {
            logout();
            alert("Session expired due to inactivity. Please login again.");
        };

        const resetTimer = () => {
            if (timeoutId) clearTimeout(timeoutId);
            timeoutId = setTimeout(handleLogout, TIMEOUT_DURATION);
        };

        const events = [
            "mousedown",
            "keypress",
            "scroll",
            "mousemove",
            "touchstart",
            "click",
        ];

        resetTimer();

        events.forEach((event) => {
            document.addEventListener(event, resetTimer);
        });

        return () => {
            if (timeoutId) clearTimeout(timeoutId);
            events.forEach((event) => {
                document.removeEventListener(event, resetTimer);
            });
        };
    }, [user]);

    const login = (newToken: string, newUser: User) => {
        localStorage.setItem("token", newToken);
        setToken(newToken);
        setUser(newUser);
        api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
    };

    const logout = async () => {
        try {
            await api.post("/auth/logout");
        } catch (e) {
            console.error("Logout failed at api level", e);
        }
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
        delete api.defaults.headers.common["Authorization"];
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
