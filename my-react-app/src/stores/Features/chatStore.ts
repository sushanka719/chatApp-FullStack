import { io, Socket } from 'socket.io-client';
import axios from 'axios';
import { produce } from 'immer';
import { create } from 'zustand';
import { useAuthStore } from './authStore'; // Import your auth store

interface Sender {
    id: number;
    username: string;
    isOnline: boolean;
}

interface Message {
    id: string;
    content: string;
    timestamp: string;
    sender: Sender;
    chatId: string;
}

interface Chat {
    id: string;
    isGroup: boolean;
    participants: Sender[];
}

interface ChatState {
    socket: Socket | null;
    isConnected: boolean;
    chats: { [chatId: string]: Chat };
    currentChatId: string | null;
    messages: Message[];
    page: number;
    limit: number;
    hasMore: boolean;
    isLoading: boolean;
    error: string | null;
    totalMessages: number;
    typingUsers: { [chatId: string]: number[] };
    connect: () => void;
    disconnect: () => void;
    joinChat: (chatId: string) => void;
    leaveChat: (chatId: string) => void;
    startPrivateChat: (userId: number) => Promise<void>;
    fetchMessages: (chatId: string, reset?: boolean) => Promise<void>;
    sendMessage: (content: string) => void;
    setTyping: (chatId: string, isTyping: boolean) => void;
    setPage: (page: number) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
    socket: null,
    isConnected: false,
    chats: {},
    currentChatId: null,
    messages: [],
    page: 1,
    limit: 20,
    hasMore: true,
    isLoading: false,
    error: null,
    totalMessages: 0,
    typingUsers: {},

    connect: () => {
        const existingSocket = get().socket;
        if (existingSocket) {
            existingSocket.disconnect();
        }

        const socket = io('http://localhost:5000', {
            withCredentials: true,
        });

        socket.on('connect', () => {
            console.log('Connected to WebSocket server');
            set({ isConnected: true, socket, error: null });
            // Rejoin current chat if exists
            const currentChatId = get().currentChatId;
            if (currentChatId) {
                socket.emit('joinChat', currentChatId);
            }
        });

        socket.on('connect_error', (error) => {
            console.error('Connection error:', error.message);
            set({ isConnected: false, error: error.message });
            socket.disconnect();
        });

        socket.on('error', (error) => {
            console.error('Server error:', error.message);
            set(
                produce((state: ChatState) => {
                    state.error = error.message;
                    // Remove temp message if save failed
                    if (error.message.includes('Failed to save message')) {
                        state.messages = state.messages.filter((m) => !m.id.startsWith('temp_'));
                        console.log('Removed temp message due to server error');
                    }
                })
            );
        });

        socket.on('newMessage', (message: Message) => {
            console.log('Received newMessage:', message);
            set(
                produce((state: ChatState) => {
                    if (state.currentChatId === message.chatId) {
                        // Match temp message by content and sender
                        const tempMessage = state.messages.find(
                            (m) => m.id.startsWith('temp_') && m.content === message.content && m.sender.id === message.sender.id
                        );
                        if (tempMessage) {
                            state.messages = state.messages.filter((m) => m.id !== tempMessage.id);
                        }
                        if (!state.messages.some((m) => m.id === message.id)) {
                            state.messages.unshift(message);
                            state.totalMessages += 1;
                            console.log('Updated messages:', state.messages);
                        }
                    } else {
                        console.log('Message ignored:', {
                            currentChatId: state.currentChatId,
                            messageChatId: message.chatId,
                            isDuplicate: state.messages.some((m) => m.id === message.id),
                        });
                    }
                })
            );
        });

        socket.on('userTyping', ({ userId, isTyping, chatId }) => {
            set(
                produce((state: ChatState) => {
                    const typingUsers = { ...state.typingUsers };
                    if (isTyping) {
                        typingUsers[chatId] = [...(typingUsers[chatId] || []), userId];
                    } else {
                        typingUsers[chatId] = (typingUsers[chatId] || []).filter((id) => id !== userId);
                    }
                    state.typingUsers = typingUsers;
                })
            );
        });

        socket.on('userOnline', ({ userId }) => {
            set(
                produce((state: ChatState) => {
                    Object.values(state.chats).forEach((chat) => {
                        const participant = chat.participants.find((p) => p.id === userId);
                        if (participant) {
                            participant.isOnline = true;
                        }
                    });
                    state.messages = state.messages.map((msg) =>
                        msg.sender.id === userId ? { ...msg, sender: { ...msg.sender, isOnline: true } } : msg
                    );
                    console.log(`User ${userId} is online, updated status`);
                })
            );
        });

        socket.on('userOffline', ({ userId }) => {
            set(
                produce((state: ChatState) => {
                    Object.values(state.chats).forEach((chat) => {
                        const participant = chat.participants.find((p) => p.id === userId);
                        if (participant) {
                            participant.isOnline = false;
                        }
                    });
                    state.messages = state.messages.map((msg) =>
                        msg.sender.id === userId ? { ...msg, sender: { ...msg.sender, isOnline: false } } : msg
                    );
                    console.log(`User ${userId} is offline, updated status`);
                })
            );
        });

        set({ socket });
    },

    disconnect: () => {
        const { socket } = get();
        if (socket) {
            socket.disconnect();
            set({ socket: null, isConnected: false, error: null, typingUsers: {}, currentChatId: null });
        }
    },

    joinChat: (chatId: string) => {
        const { socket } = get();
        if (socket && socket.connected) {
            socket.emit('joinChat', chatId);
            console.log(`Joined chat: ${chatId}`);
        } else {
            set({ error: 'Socket not connected' });
        }
    },

    leaveChat: (chatId: string) => {
        const { socket } = get();
        if (socket && socket.connected) {
            socket.emit('leaveChat', chatId);
            console.log(`Left chat: ${chatId}`);
        }
    },

    startPrivateChat: async (userId: number) => {
        try {
            set({ isLoading: true, error: null });
            const response = await axios.post(
                'http://localhost:5000/chats/private',
                { userId },
                { withCredentials: true }
            );
            const chat = response.data;
            console.log('Chat created:', chat);
            set(
                produce((state: ChatState) => {
                    state.chats[chat.id] = {
                        id: chat.id,
                        isGroup: false,
                        participants: chat.participants,
                    };
                    state.currentChatId = chat.id;
                    console.log('Set currentChatId:', chat.id);
                })
            );
            get().joinChat(chat.id);
            await get().fetchMessages(chat.id, true);
        } catch (error: any) {
            console.error('startPrivateChat error:', error);
            set({ error: error.response?.data?.message || 'Failed to start private chat' });
        } finally {
            set({ isLoading: false });
        }
    },

    fetchMessages: async (chatId: string, reset = false) => {
        try {
            set({ isLoading: true, error: null });

            if (reset) {
                set({ messages: [], page: 1, hasMore: true, totalMessages: 0 });
            }

            const response = await axios.get(`http://localhost:5000/chats/${chatId}/messages`, {
                params: { page: get().page, limit: get().limit },
                withCredentials: true,
            });

            const { data, totalMessages } = response.data;
            console.log('Fetched messages:', data);
            set(
                produce((state: ChatState) => {
                    const newMessages = data.reverse().filter(
                        (msg: Message) => !state.messages.some((m) => m.id === msg.id)
                    );
                    state.messages = reset
                        ? [...newMessages, ...state.messages.filter((m) => m.id.startsWith('temp_'))]
                        : [...newMessages, ...state.messages];
                    state.totalMessages = totalMessages;
                    state.hasMore = data.length === get().limit;
                    if (data.length > 0) {
                        state.page += 1;
                    }
                })
            );
        } catch (error: any) {
            console.error('Fetch messages error:', error);
            set({ error: error.response?.data?.message || 'Failed to fetch messages' });
        } finally {
            set({ isLoading: false });
        }
    },

    sendMessage: (content: string) => {
        const { socket, currentChatId } = get();
        const user = useAuthStore.getState().user; // Get actual user
        if (socket && socket.connected && currentChatId && user) {
            console.log('Emitting sendMessage:', { chatId: currentChatId, content });
            socket.emit('sendMessage', { chatId: currentChatId, content });

            const tempMessage: Message = {
                id: `temp_${Date.now()}_${Math.random().toString(36).slice(2)}`, // Unique temp ID
                content,
                timestamp: new Date().toISOString(),
                sender: {
                    id: user.id,
                    username: user.username || 'You',
                    isOnline: true,
                },
                chatId: currentChatId,
            };
            set(
                produce((state: ChatState) => {
                    state.messages.unshift(tempMessage);
                    state.totalMessages += 1;
                    console.log('Optimistically added message:', tempMessage);
                })
            );
        } else {
            console.error('Cannot send message:', {
                socket: !!socket,
                isConnected: socket?.connected,
                currentChatId,
                user: !!user,
            });
            set({ error: 'Socket not connected, no chat selected, or user not authenticated' });
        }
    },

    setTyping: (chatId: string, isTyping: boolean) => {
        const { socket } = get();
        if (socket && socket.connected) {
            socket.emit('typing', { chatId, isTyping });
        }
    },

    setPage: (page: number) => {
        if (page >= 1) {
            set({ page });
        }
    },
}));