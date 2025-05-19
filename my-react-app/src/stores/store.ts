import { create } from "zustand";
import { useAuthStore } from "./Features/authStore";
import { useSearchStore } from "./Features/search";
import { useFriendRequestStore } from "./Features/friendRequest";
import { useChatStore } from "./Features/chatStore";

// Define RootState by combining all feature store types
type RootState = ReturnType<typeof useAuthStore> & ReturnType<typeof useSearchStore>

export const useStore = create<RootState>(() => ({
    ...useAuthStore(), // Merge auth store
    ...useSearchStore(),
    ...useChatStore(),
    ...useFriendRequestStore()
}));