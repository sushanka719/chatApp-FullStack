import React from 'react';
import { Sidebar } from './Sidebar';
import { ChatArea } from './ChatArea';
import { useFriendRequestStore } from '../stores/Features/friendRequest';
export const ChatApp: React.FC = () => {
    const { selectedFriend, setSelectedFriend } = useFriendRequestStore();
    return (
        <div className="flex w-full h-screen bg-white">
            <Sidebar
                onSelectUser={setSelectedFriend}
                selectedUserId={selectedFriend?.id ?? null}
            />
            <div className="flex-1 flex">
                <ChatArea/>
            </div>
        </div>
    );
};
  