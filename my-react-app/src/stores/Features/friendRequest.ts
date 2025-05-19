import { create } from 'zustand';

interface FriendRequest {
    id: string;
    senderId: string;
    receiverId: string;
    status: 'pending' | 'accepted' | 'rejected';
    createdAt: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    isOnline?: boolean;
    chatId?: string;
}

interface FriendRequestState {
    isLoading: boolean;
    error: string | null;
    lastRequest?: FriendRequest;
    friends: User[];
    pendingRequests: FriendRequest[];

    selectedFriend: User | null;
    setSelectedFriend: (u: User | null) => void;
    /**
     * Send a new friend request to a user by their ID.
     */
    send: (receiverId: string) => Promise<void>;
    /**
     * Accept or reject a pending friend request.
     * After a successful update the store will automatically refresh the current
     * friends list and pending requests.
     */
    respond: (requestId: string, status: 'accepted' | 'rejected') => Promise<void>;
    /**
     * Fetch the authenticated user's friends list from the server.
     */
    fetchFriends: () => Promise<void>;
    /**
     * Fetch all pending friend requests for the authenticated user.
     */
    getUserFriendRequests: () => Promise<void>;
    /**
     * Clear the current error value.
     */
    clearError: () => void;
}

export const useFriendRequestStore = create<FriendRequestState>((set, get) => ({
    isLoading: false,
    error: null,
    lastRequest: undefined,
    friends: [],
    pendingRequests: [],
    selectedFriend: null,
    setSelectedFriend: (u) => set({ selectedFriend: u }),

    /**
     * Send a new friend request
     */
    send: async (receiverId: string) => {
        if (!receiverId) return;
        set({ isLoading: true, error: null });
        try {
            const res = await fetch('http://localhost:5000/friend-requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ receiverId }),
            });
            if (!res.ok) throw new Error(await res.text());
            const data: FriendRequest = await res.json();
            set({ lastRequest: data, isLoading: false });
        } catch (err) {
            set({
                error: err instanceof Error ? err.message : 'Could not send request',
                isLoading: false,
            });
        }
    },

    /**
     * Accept or reject a friend request
     */
    respond: async (requestId: string, status: 'accepted' | 'rejected') => {
        if (!requestId) return;
        console.log(status, requestId)
        set({ isLoading: true, error: null });
        try {
            const res = await fetch(`http://localhost:5000/friend-requests/${requestId}/respond`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ status }),
            });
            if (!res.ok) throw new Error(await res.text());
            const updated: FriendRequest = await res.json();

            // Update local pending list immediately for responsiveness
            set(state => ({
                pendingRequests: state.pendingRequests.filter(pr => pr.id !== updated.id),
            }));

            // If accepted, refresh friends list; if rejected we just updated pending list
            if (status === 'accepted') {
                await get().fetchFriends();
            }
            // Always refresh pending list from server to stay in sync
            await get().getUserFriendRequests();
            set({ isLoading: false });
        } catch (err) {
            set({
                error: err instanceof Error ? err.message : 'Failed to update request',
                isLoading: false,
            });
        }
    },

    fetchFriends: async () => {
        set({ isLoading: true, error: null });
        try {
            const res = await fetch('http://localhost:5000/friend-requests/friends', {
                method: 'GET',
                credentials: 'include',
            });
            if (!res.ok) throw new Error(await res.text());
            const friends: User[] = await res.json();
            set({ friends, isLoading: false });
            console.log(friends)
        } catch (err) {
            set({
                error: err instanceof Error ? err.message : 'Failed to fetch friends',
                isLoading: false,
            });
        }
    },

    getUserFriendRequests: async () => {
        set({ isLoading: true, error: null });
        try {
            const res = await fetch('http://localhost:5000/friend-requests', {
                method: 'GET',
                credentials: 'include',
            });
            if (!res.ok) throw new Error(await res.text());
            const pending: FriendRequest[] = await res.json();
            set({ pendingRequests: pending, isLoading: false });
        } catch (err) {
            set({
                error: err instanceof Error ? err.message : 'Failed to fetch requests',
                isLoading: false,
            });
        }
    },

    clearError: () => set({ error: null }),
}));
