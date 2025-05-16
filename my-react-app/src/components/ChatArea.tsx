import React, { useState } from 'react'
import { SendIcon, PaperclipIcon, SmileIcon } from 'lucide-react'
import { MessageBubble } from './MessageBubble'
interface ChatAreaProps {
    selectedUserId?: number
}
const demoMessages = [
    {
        id: 1,
        content: 'Hey, how are you?',
        timestamp: '10:30 AM',
        isOwn: false,
        status: 'read' as const,
    },
    {
        id: 2,
        content: "I'm good, thanks! How about you?",
        timestamp: '10:31 AM',
        isOwn: true,
        status: 'read' as const,
    },
    {
        id: 3,
        content: 'Great! Would you like to meet for coffee tomorrow?',
        timestamp: '10:32 AM',
        isOwn: false,
        status: 'read' as const,
    },
]
export const ChatArea: React.FC<ChatAreaProps> = ({ selectedUserId }) => {
    const [newMessage, setNewMessage] = useState('')
    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault()
        if (newMessage.trim()) {
            console.log('Sending message:', newMessage)
            setNewMessage('')
        }
    }
    if (!selectedUserId) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
                <p className="text-gray-500">Select a conversation to start chatting</p>
            </div>
        )
    }
    return (
        <div className="flex-1 flex flex-col h-full">
            <div className="border-b border-gray-200 p-4">
                <div className="flex items-center gap-3">
                    <img
                        src="https://randomuser.me/api/portraits/women/1.jpg"
                        alt="User avatar"
                        className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                        <h2 className="font-medium">Sarah Wilson</h2>
                        <p className="text-sm text-green-500">Online</p>
                    </div>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {demoMessages.map((message) => (
                    <MessageBubble key={message.id} {...message} />
                ))}
            </div>
            <form
                onSubmit={handleSendMessage}
                className="p-4 border-t border-gray-200 bg-white"
            >
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <PaperclipIcon className="h-5 w-5 text-gray-500" />
                    </button>
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                        type="button"
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <SmileIcon className="h-5 w-5 text-gray-500" />
                    </button>
                    <button
                        type="submit"
                        className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                    >
                        <SendIcon className="h-5 w-5" />
                    </button>
                </div>
            </form>
        </div>
    )
}
