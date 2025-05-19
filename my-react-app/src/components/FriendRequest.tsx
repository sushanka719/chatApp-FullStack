import React, { useEffect } from 'react';
import { Check, X } from 'lucide-react';
import { useFriendRequestStore } from '../stores/Features/friendRequest';

function getRelativeTime(date: Date | string): string {
    const now: Date = new Date();
    const past: Date = typeof date === 'string' ? new Date(date) : date;
    const diffInSeconds: number = Math.floor((now.getTime() - past.getTime()) / 1000);

    const units: { name: string; seconds: number }[] = [
        { name: 'year', seconds: 31536000 },
        { name: 'month', seconds: 2592000 },
        { name: 'day', seconds: 86400 },
        { name: 'hour', seconds: 3600 },
        { name: 'minute', seconds: 60 },
        { name: 'second', seconds: 1 }
    ];

    for (const unit of units) {
        const value: number = Math.floor(diffInSeconds / unit.seconds);
        if (value >= 1) {
            return value === 1
                ? `${value} ${unit.name} ago`
                : `${value} ${unit.name}s ago`;
        }
    }
    return 'just now';
}

export const FriendRequest: React.FC = () => {
    const {
        isLoading,
        error,
        pendingRequests,
        getUserFriendRequests,
        respond,                 // ← NEW
    } = useFriendRequestStore();

    /* load pending requests once */
    useEffect(() => {
        getUserFriendRequests();
    }, [getUserFriendRequests]);

    /* render states */
    if (isLoading) return <p>Loading…</p>;
    if (error) return <p className="text-red-500">{error}</p>;
    if (!pendingRequests.length) return <p>No pending requests.</p>;

    return (
        <ul className="divide-y">
            {pendingRequests.map((req) => (
                <li
                    key={req.id}
                    className="flex items-center justify-between p-3 hover:bg-gray-50"
                >
                    {/* left: avatar + username + timestamp */}
                    <div className="flex items-center gap-3">
                        <img
                            src={`https://api.dicebear.com/7.x/identicon/svg?seed=${req.sender.username}`}
                            alt="avatar"
                            className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                            <h4 className="font-medium">{req.sender.username}</h4>
                            <p className="text-sm text-gray-500">
                                {getRelativeTime(req.createdAt)}
                            </p>
                        </div>
                    </div>

                    {/* right: accept / reject */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => respond(req.id, 'accepted')}   
                            className="p-2 text-green-500 hover:bg-green-50 rounded-full"
                        >
                            <Check className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => respond(req.id, 'rejected')}   
                            className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </li>
            ))}
        </ul>
    );
  };