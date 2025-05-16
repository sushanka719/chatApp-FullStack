import React, { useState } from 'react'
import { Sidebar } from './Sidebar'
import { ChatArea } from './ChatArea'
export const ChatApp: React.FC = () => {
    const [selectedUserId, setSelectedUserId] = useState<number>()
    return (
        <div className="flex w-full h-screen bg-white">
            <div className="hidden md:block">
                <Sidebar
                    onSelectUser={setSelectedUserId}
                    selectedUserId={selectedUserId}
                />
            </div>
            <div className="flex-1 flex">
                <ChatArea selectedUserId={selectedUserId} />
            </div>
        </div>
    )
}
