// stores/search.store.ts
import { create } from 'zustand';

interface User {
    id: string;
    username: string;
    email: string;
}

interface SearchState {
    results: User[];
    isLoading: boolean;
    error: string | null;
    searchUsers: (query: string, currentUserId: string) => Promise<void>;
    clearResults: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
    results: [],
    isLoading: false,
    error: null,

    searchUsers: async (query, currentUserId) => {
        if (!query || query.length < 3) {
            set({ results: [] });
            return;
        }

        set({ isLoading: true, error: null });

        try {
            const response = await fetch(`http://localhost:5000/users/search?q=${encodeURIComponent(query)}`, {
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include' // For cookies if using auth
            });

            if (!response.ok) {
                throw new Error(await response.text());
            }

            const data = await response.json();
            set({ results: data, isLoading: false });
        } catch (err) {
            set({
                error: err instanceof Error ? err.message : 'Search failed',
                isLoading: false
            });
        }
    },

    clearResults: () => set({ results: [], error: null })
}));