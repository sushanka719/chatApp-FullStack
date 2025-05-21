import React, { useEffect, useState, useRef } from 'react';
import { SendIcon, PaperclipIcon, SmileIcon } from 'lucide-react';
import { useFriendRequestStore } from '../stores/Features/friendRequest';
import { useChatStore } from '../stores/Features/chatStore';
import { useAuthStore } from '../stores/Features/authStore';
import { MessageBubble } from './MessageBubble';
import { useNavigate } from 'react-router-dom';

export const ChatArea: React.FC = () => {
    const { selectedFriend } = useFriendRequestStore();
    const {
        currentChatId,
        messages,
        isConnected,
        error: chatError,
        typingUsers,
        startPrivateChat,
        fetchMessages,
        sendMessage,
        setTyping,
        joinChat,
        connect,
        isLoading,
    } = useChatStore();

    const {
        user,
        isAuthenticated,
        isLoading: authLoading,
        error: authError,
        checkAuth,
    } = useAuthStore();

    const [isChatInitialized, setIsChatInitialized] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [prevFriendId, setPrevFriendId] = useState<number | null>(null); // Track previous friend
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Check authentication on mount
    useEffect(() => {
        if (!isAuthenticated && !authLoading && !authError) {
            console.log('ChatArea: Checking authentication', new Date().toISOString());
            checkAuth();
        }
    }, [isAuthenticated, authLoading, authError, checkAuth]);

    // Connect to WebSocket
    useEffect(() => {
        if (isAuthenticated && !isConnected && !isConnecting) {
            console.log('ChatArea: Connecting to chat', new Date().toISOString());
            setIsConnecting(true);
            connect();
            connectionTimeoutRef.current = setTimeout(() => {
                console.log('ChatArea: Connection timed out', new Date().toISOString());
                setIsConnecting(false);
            }, 10000);
        }
        return () => {
            if (connectionTimeoutRef.current) {
                clearTimeout(connectionTimeoutRef.current);
            }
        };
    }, [isAuthenticated, isConnected, connect, isConnecting]);

    // Initialize chat for selected friend
    useEffect(() => {
        if (
            selectedFriend &&
            isAuthenticated &&
            (!isChatInitialized || prevFriendId !== selectedFriend.id)
        ) {
            console.log('ChatArea: Initializing chat for friend', selectedFriend.id);
            const initChat = async () => {
                try {
                    await startPrivateChat(selectedFriend.id);
                    if (currentChatId) {
                        await fetchMessages(currentChatId, true);
                        joinChat(currentChatId);
                        setIsChatInitialized(true);
                        setPrevFriendId(selectedFriend.id);
                    }
                } catch (err) {
                    console.error('ChatArea: Failed to initialize chat:', err);
                    useChatStore.setState({ error: 'Failed to initialize chat' });
                }
            };
            initChat();
        }
    }, [selectedFriend, isAuthenticated, isChatInitialized, prevFriendId, startPrivateChat, fetchMessages, joinChat, currentChatId]);

    // Scroll to bottom for new messages or initialization
    useEffect(() => {
        if (messagesContainerRef.current && (messages.length > 0 || isChatInitialized)) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
            console.log('ChatArea: Scrolled to bottom', messages.length);
        }
    }, [messages, isChatInitialized]);

    // Log message updates
    useEffect(() => {
        console.log('Messages updated in UI:', messages);
    }, [messages]);

    const [newMessage, setNewMessage] = useState('');

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !currentChatId) return;
        console.log('ChatArea: Sending message', newMessage);
        sendMessage(newMessage);
        setNewMessage('');
        setTyping(currentChatId, false);
    };

    const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewMessage(e.target.value);
        if (currentChatId) {
            setTyping(currentChatId, e.target.value.length > 0);
        }
    };

    if (authLoading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
                <p className="text-gray-500">Checking authentication...</p>
            </div>
        );
    }

    if (authError) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
                <p className="text-red-500">
                    Authentication error: {authError}
                    <button
                        onClick={() => {
                            useAuthStore.getState().reset();
                            navigate('/login');
                        }}
                        className="ml-2 text-blue-500 underline"
                    >
                        Log In Again
                    </button>
                </p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
                <p className="text-gray-500">
                    Please log in to start chatting
                    <button
                        onClick={() => navigate('/login')}
                        className="ml-2 text-blue-500 underline"
                    >
                        Log In
                    </button>
                </p>
            </div>
        );
    }

    if (!selectedFriend) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
                <p className="text-gray-500">Select a conversation to start chatting</p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full">
            <div className="border-b border-gray-200 p-4">
                <div className="flex items-center gap-3">
                    <img
                        src="https://randomuser.me/api/portraits/women/1.jpg"
                        alt="avatar"
                        className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                        <h2 className="font-medium">{selectedFriend.username}</h2>
                        <p className="text-sm text-green-500">
                            {selectedFriend.isOnline ? 'Online' : 'Offline'}
                        </p>
                    </div>
                </div>
            </div>

            {!isConnected && (
                <div className="p-4 text-red-500 text-center">
                    Disconnected from chat server
                    <button
                        onClick={() => {
                            if (!isConnecting) {
                                console.log('ChatArea: Manual retry connect', new Date().toISOString());
                                setIsConnecting(true);
                                connect();
                            }
                        }}
                        className="ml-2 text-blue-500 underline"
                        disabled={isConnecting}
                    >
                        Retry
                    </button>
                </div>
            )}
            {chatError && (
                <div className="p-4 text-red-500 text-center">
                    Chat Error: {chatError}
                    <button
                        onClick={() => useChatStore.setState({ error: null })}
                        className="ml-2 text-blue-500 underline"
                    >
                        Dismiss
                    </button>
                </div>
            )}
            {isLoading && (
                <div className="p-4 text-center text-gray-500">Loading messages...</div>
            )}

            <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col-reverse gap-4"
            >
                {messages.length === 0 && !isLoading && (
                    <p className="text-gray-500 text-center">No messages yet</p>
                )}
                {messages.map((m) => (
                    <MessageBubble
                        key={m.id}
                        id={m.id}
                        content={m.content}
                        timestamp={m.timestamp}
                        isOwn={m.sender.id === user?.id} // Use authenticated user ID
                        status="read"
                    />
                ))}
                <div ref={messagesEndRef} />
            </div>

            {currentChatId && (typingUsers[currentChatId]?.length ?? 0) > 0 && (
                <div className="p-2 text-sm text-gray-500">
                    {typingUsers[currentChatId]
                        ?.map((userId) => {
                            const participant = selectedFriend.id === userId ? selectedFriend.username : `User ${userId}`;
                            return participant;
                        })
                        .join(', ')} {typingUsers[currentChatId].length > 1 ? 'are' : 'is'} typing...
                </div>
            )}

            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white">
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        className="p-2 hover:bg-gray-100 rounded-full"
                        disabled={!currentChatId || !isConnected}
                    >
                        <PaperclipIcon className="w-5 h-5 text-gray-500" />
                    </button>

                    <input
                        value={newMessage}
                        onChange={handleTyping}
                        placeholder="Type a message…"
                        className="flex-1 p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={!currentChatId || !isConnected}
                    />

                    <button
                        type="button"
                        className="p-2 hover:bg-gray-100 rounded-full"
                        disabled={!currentChatId || !isConnected}
                    >
                        <SmileIcon className="w-5 h-5 text-gray-500" />
                    </button>

                    <button
                        type="submit"
                        className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
                        disabled={!currentChatId || !newMessage.trim() || !isConnected}
                    >
                        <SendIcon className="w-5 h-5" />
                    </button>
                </div>
            </form>
        </div>
    );
};