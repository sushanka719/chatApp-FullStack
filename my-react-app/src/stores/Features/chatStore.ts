import { io, Socket } from 'socket.io-client';
import axios from 'axios';
import { produce } from 'immer';
import { create } from 'zustand';

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
        });

        socket.on('connect_error', (error) => {
            console.error('Connection error:', error.message, error);
            set({ isConnected: false, error: error.message });
            socket.disconnect();
        });

        socket.on('error', (error) => {
            console.error('Server error:', error.message);
            set({ error: error.message });
        });

        socket.on('newMessage', (message: Message) => {
            // console.log('Received newMessage:', message);
            set(
                produce((state: ChatState) => {
                    if (state.currentChatId === message.chatId) {
                        state.messages = state.messages.filter((m) => !m.id.startsWith('temp_'));
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
            // console.log('State after newMessage:', get().messages);
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
                params: { page: reset ? 1 : get().page, limit: get().limit },
                withCredentials: true,
            });

            const { data, totalMessages } = response.data;
            console.log('Fetched messages:', data);
            const totalPages = Math.ceil(totalMessages / get().limit);

            set(
                produce((state: ChatState) => {
                    if (reset && totalPages > 0) {
                        state.page = totalPages;
                    } else if (reset) {
                        state.page = 1;
                    }

                    state.messages = reset ? data.reverse() : [...data.reverse(), ...state.messages];
                    state.hasMore = state.page > 1;

                    if (!reset && data.length > 0) {
                        state.page -= 1;
                    }

                    state.totalMessages = totalMessages;
                })
            );
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Failed to fetch messages',
                isLoading: false,
            });
        } finally {
            set({ isLoading: false });
        }
    },

    sendMessage: (content: string) => {
        const { socket, currentChatId } = get();
        if (socket && socket.connected && currentChatId) {
            console.log('Emitting sendMessage:', { chatId: currentChatId, content });
            socket.emit('sendMessage', { chatId: currentChatId, content });

            // Optimistically add message to UI
            const tempMessage: Message = {
                id: `temp_${Date.now()}`,
                content,
                timestamp: new Date().toISOString(),
                sender: { id: 1, username: 'You', isOnline: true }, // Replace with actual user data
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
            });
            set({ error: 'Socket not connected or no chat selected' });
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