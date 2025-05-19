import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Check, X } from 'lucide-react';
import { useSearchStore } from '../stores/Features/search';
import { useAuthStore } from '../stores/Features/authStore';
import { useFriendRequestStore } from '../stores/Features/friendRequest';

interface SearchResult {
    id: string;
    name: string;
    avatar: string;
    status: 'none' | 'pending' | 'accepted';
}

export const FriendSearch: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const { user } = useAuthStore();
    const { results, isLoading, error, searchUsers, clearResults } =
        useSearchStore();

    // 💬 NEW ─ store for sending requests
    const {
        send: sendFriendRequest,
        isLoading: sending,
        error: sendError,
        lastRequest,
    } = useFriendRequestStore();

    /* ───────────────── Debounced search ───────────────── */
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery.trim().length > 0) {
                searchUsers(searchQuery, user?.id || '');
            } else {
                clearResults();
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery, user?.id]);

    /* ───────────────── Format API results ───────────────── */
    const formattedResults: SearchResult[] = results.map((u) => ({
        id: u.id,
        name: u.username,
        avatar: `https://randomuser.me/api/portraits/men/4.jpg`,
        status:
            lastRequest?.receiverId === u.id
                ? 'pending'
                : 'none', // rudimentary status check
    }));

    return (
        <div className="p-4 border-b border-gray-200">
            {/* search input */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                    type="text"
                    placeholder="Search for friends…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {isLoading && (
                <div className="mt-4 text-center text-gray-500">Searching…</div>
            )}
            {error && <div className="mt-4 text-center text-red-500">{error}</div>}
            {sendError && (
                <div className="mt-4 text-center text-red-500">{sendError}</div>
            )}

            {!isLoading && !error && formattedResults.length > 0 && (
                <div className="mt-4 space-y-2">
                    {formattedResults.map((result) => (
                        <div
                            key={result.id}
                            className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg"
                        >
                            <div className="flex items-center gap-3">
                                <img
                                    src={result.avatar}
                                    alt={result.name}
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                                <span className="font-medium">{result.name}</span>
                            </div>

                            {/* ─── Action area ─── */}
                            {result.status === 'none' && (
                                <button
                                    disabled={sending}
                                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-full disabled:opacity-50"
                                    onClick={() => sendFriendRequest(result.id)}
                                >
                                    <UserPlus className="w-5 h-5" />
                                </button>
                            )}

                            {result.status === 'pending' && (
                                <span className="text-sm text-gray-500">Request sent</span>
                            )}

                            {result.status === 'accepted' && (
                                <span className="text-sm text-gray-500">Friends</span>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
