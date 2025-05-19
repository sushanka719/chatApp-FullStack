import { User } from "lucide-react";
import { create } from "zustand";

type User = {
    id: string;
    email?: string;
    username?: string;
};

type AuthState = {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    isCheckingAuth: boolean;
    error: string | null;
    checkAuth: () => Promise<void>;
    reset: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isLoading: false,
    isAuthenticated: false,
    isCheckingAuth: false,
    error: null,

    checkAuth: async () => {
        try {
            set({ isCheckingAuth: true, isLoading: true, error: null });

            const response = await fetch('http://localhost:5000/auth/check', {
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Authentication check failed');
            }

            const data = await response.json();
            console.log(data)

            set({
                user: data.user,
                isAuthenticated: true,
                isCheckingAuth: false,
                isLoading: false
            });
        } catch (error) {
            set({
                user: null,
                isAuthenticated: false,
                isCheckingAuth: false,
                isLoading: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            });
        }
    },

    reset: () => {
        set({
            user: null,
            isAuthenticated: false,
            error: null,
            isLoading: false,
            isCheckingAuth: false
        });
    }
}));