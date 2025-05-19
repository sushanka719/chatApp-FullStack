import React, { useEffect, useState } from 'react'
import {
    SearchIcon,
    UserPlusIcon,
    BellIcon,
    MessageCircleIcon,
} from 'lucide-react'
import { FriendSearch } from './FriendSearch'
import { UserProfile } from './UserProfile'
import { FriendRequest } from './FriendRequest'
import { useFriendRequestStore} from '../stores/Features/friendRequest'
import type { User } from '../stores/Features/friendRequest'

interface SidebarProps {
    onSelectUser: (user: User | null) => void;
    selectedUserId?: string | null;
  }
  
const friendRequests = [
    {
        id: 101,
        name: 'David Wilson',
        avatar: 'https://randomuser.me/api/portraits/men/6.jpg',
        timestamp: '2 hours ago',
    },
]
export const Sidebar: React.FC<SidebarProps> = ({

    selectedUserId,
}) => {
    const [showFriendSearch, setShowFriendSearch] = useState(false)
    const [showRequests, setShowRequests] = useState(false)

    const handleBackToChats = () => {
        setShowFriendSearch(false)
        setShowRequests(false)
    }

    const { friends, fetchFriends, isLoading, error, setSelectedFriend } = useFriendRequestStore();

    useEffect(() => {
        fetchFriends();
    }, [fetchFriends]);

    return (
        <div className="w-full md:w-80 bg-white border-r border-gray-200 h-full flex flex-col">
            <UserProfile/>
            <div className="p-4 border-b border-gray-200">
                <div className="flex gap-2">
                    {!showFriendSearch && !showRequests ? (
                        <>
                            <button
                                onClick={() => setShowFriendSearch(true)}
                                className="flex-1 py-2 px-4 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                            >
                                <UserPlusIcon className="w-5 h-5 inline-block mr-2" />
                                Add Friends
                            </button>
                            <button
                                onClick={() => setShowRequests(true)}
                                className="flex-1 py-2 px-4 rounded-lg relative bg-gray-100 text-gray-700 hover:bg-gray-200"
                            >
                                <BellIcon className="w-5 h-5 inline-block mr-2" />
                                Requests
                                {friendRequests.length > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                        {friendRequests.length}
                                    </span>
                                )}
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={handleBackToChats}
                                className="flex-1 py-2 px-4 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                            >
                                <MessageCircleIcon className="w-5 h-5 inline-block mr-2" />
                                Back to Chats
                            </button>
                            <button
                                className={`flex-1 py-2 px-4 rounded-lg ${showFriendSearch || showRequests ? 'bg-blue-500 text-white' : ''}`}
                            >
                                {showFriendSearch ? (
                                    <>
                                        <UserPlusIcon className="w-5 h-5 inline-block mr-2" />
                                        Add Friends
                                    </>
                                ) : (
                                    <>
                                        <BellIcon className="w-5 h-5 inline-block mr-2" />
                                        Requests
                                    </>
                                )}
                            </button>
                        </>
                    )}
                </div>
            </div>
            {showFriendSearch ? (
                <FriendSearch />
            ) : showRequests ? (
                <div className="flex-1 overflow-y-auto">
                    {friendRequests.map(() => (
                        <FriendRequest/>
                    ))}
                </div>
            ) : (
                <>
                    <div className="p-4 border-b border-gray-200">
                        <div className="relative">
                            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <input
                                type="text"
                                placeholder="Search conversations..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {friends.map((user) => (
                            <div
                                key={user.id}
                                onClick={() => setSelectedFriend(user)}
                                className={`flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer ${selectedUserId === user.id ? 'bg-blue-50' : ''}`}
                            >
                                <div className="relative">
                                    <img
                                        src="https://randomuser.me/api/portraits/women/1.jpg" // static avatar
                            alt="user avatar"
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                    <span
                                        className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full ${user.status === 'online' ? 'bg-green-500' : user.status === 'away' ? 'bg-yellow-500' : 'bg-gray-500'}`}
                                    />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-medium">{user.username}</h3>
                                        {user.unreadCount && (
                                            <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                                {user.unreadCount}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500 truncate">
                                        {user.lastMessage || 'hello'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}
