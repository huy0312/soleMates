import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Loader, Minus, Smile, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import { format } from 'date-fns';
import EmojiPicker from 'emoji-picker-react';

const GIFS = [
    "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExN2l4bmVqZnN4amh1N2l4bmVqZnN4amh1N2l4bmVqZnN4amh1/3o7TKSjRrfIPjeiVyM/giphy.gif",
    "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExN2l4bmVqZnN4amh1N2l4bmVqZnN4amh1N2l4bmVqZnN4amh1/l0HlHFRbmaZtBRhXG/giphy.gif",
    "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExN2l4bmVqZnN4amh1N2l4bmVqZnN4amh1N2l4bmVqZnN4amh1/26AHONQ79FdWZhAI0/giphy.gif",
    "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExN2l4bmVqZnN4amh1N2l4bmVqZnN4amh1N2l4bmVqZnN4amh1/3o6Zt481isNVuQI1l6/giphy.gif",
    "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExN2l4bmVqZnN4amh1N2l4bmVqZnN4amh1N2l4bmVqZnN4amh1/l0MYt5qxb9d3DQ0bm/giphy.gif",
    "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExN2l4bmVqZnN4amh1N2l4bmVqZnN4amh1N2l4bmVqZnN4amh1/3oEjI6SIIHBdRxXI40/giphy.gif"
];

const ChatBox = ({ friend, onClose }) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [isMinimized, setIsMinimized] = useState(false);
    const [showEmoji, setShowEmoji] = useState(false);
    const [showGif, setShowGif] = useState(false);
    const messagesEndRef = useRef(null);
    const stompClientRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (user && friend) {
            fetchHistory();
            connectWebSocket();
        }

        return () => {
            if (stompClientRef.current) {
                stompClientRef.current.disconnect();
            }
        };
    }, [user, friend]);

    useEffect(() => {
        if (!isMinimized) {
            scrollToBottom();
            if (messages.length > 0 && isConnected) {
                const lastMsg = messages[messages.length - 1];
                if (lastMsg.senderId === friend.id && !lastMsg.isRead) {
                    markAsRead();
                }
            }
        }
    }, [messages, isMinimized, isConnected]);

    const fetchHistory = async () => {
        try {
            const res = await api.get(`/messages/${friend.id}`);
            setMessages(res.data);
        } catch (error) {
            console.error("Failed to fetch chat history", error);
        } finally {
            setLoading(false);
        }
    };

    const connectWebSocket = () => {
        const socket = new SockJS('http://localhost:8080/ws');
        const client = Stomp.over(socket);
        client.debug = () => { };

        client.connect({}, () => {
            // Subscribe to private messages via topic (bypass need for auth principal)
            client.subscribe(`/topic/messages/${user.id}`, (message) => {
                const receivedMsg = JSON.parse(message.body);

                if (receivedMsg.type === 'READ_RECEIPT') {
                    if (receivedMsg.readerId === friend.id) {
                        setMessages(prev => prev.map(msg =>
                            msg.senderId === user.id ? { ...msg, isRead: true } : msg
                        ));
                    }
                } else if (receivedMsg.senderId === friend.id || receivedMsg.receiverId === friend.id) {
                    setMessages(prev => {
                        // Prevent duplicates
                        if (prev.some(m => m.id === receivedMsg.id)) return prev;
                        return [...prev, receivedMsg];
                    });

                    // If message is from friend, mark as read immediately if chat is open
                    if (receivedMsg.senderId === friend.id) {
                        markAsRead();
                    }
                }
            });
            stompClientRef.current = client;
            setIsConnected(true);
        }, (error) => {
            console.error("Chat WebSocket error", error);
            setIsConnected(false);
        });
    };

    const markAsRead = () => {
        if (stompClientRef.current && stompClientRef.current.connected) {
            stompClientRef.current.send("/app/seen", {}, JSON.stringify({
                senderId: friend.id,
                receiverId: user.id
            }));
            setMessages(prev => prev.map(msg =>
                msg.senderId === friend.id && !msg.isRead ? { ...msg, isRead: true } : msg
            ));
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleSend = (content = newMessage) => {
        if (!content.trim() || !stompClientRef.current) return;

        const messagePayload = {
            senderId: user.id,
            receiverId: friend.id,
            content: content.trim()
        };

        stompClientRef.current.send("/app/chat", {}, JSON.stringify(messagePayload));

        // Optimistic update
        const optimisticMsg = {
            id: Date.now(),
            senderId: user.id,
            receiverId: friend.id,
            content: content.trim(),
            createdAt: new Date().toISOString()
        };
        setMessages(prev => [...prev, optimisticMsg]);
        setNewMessage('');
        setShowEmoji(false);
        setShowGif(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const onEmojiClick = (emojiObject) => {
        setNewMessage(prev => prev + emojiObject.emoji);
    };

    const isImageUrl = (url) => {
        if (!url) return false;
        return (url.match(/\.(jpeg|jpg|gif|png)$/) != null) || url.includes('giphy.com');
    };

    if (isMinimized) {
        return (
            <div className="fixed bottom-0 right-4 w-72 bg-[#242526] rounded-t-xl shadow-2xl border border-white/10 z-50 cursor-pointer"
                onClick={() => setIsMinimized(false)}>
                <div className="p-3 flex justify-between items-center bg-[#3A3B3C] rounded-t-xl hover:bg-[#4E4F50] transition-colors">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-700 overflow-hidden relative">
                            {friend.avatarUrl ? (
                                <img src={friend.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold bg-cyan-600">
                                    {friend.fullName ? friend.fullName.charAt(0).toUpperCase() : 'U'}
                                </div>
                            )}
                            <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-[#242526]"></div>
                        </div>
                        <h3 className="font-semibold text-white text-sm truncate max-w-[150px]">
                            {friend.fullName || friend.username}
                        </h3>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed bottom-0 right-4 w-96 bg-[#242526] rounded-t-xl shadow-2xl border border-white/10 flex flex-col z-50 h-[500px]">
            {/* Header */}
            <div className="p-3 border-b border-white/10 flex justify-between items-center bg-[#3A3B3C] rounded-t-xl">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden relative">
                        {friend.avatarUrl ? (
                            <img src={friend.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-white text-sm font-bold bg-gradient-to-br from-blue-500 to-cyan-500">
                                {friend.fullName ? friend.fullName.charAt(0).toUpperCase() : 'U'}
                            </div>
                        )}
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#242526]"></div>
                    </div>
                    <div>
                        <h3 className="font-semibold text-white text-base truncate max-w-[200px]">
                            {friend.fullName || friend.username}
                        </h3>
                        <p className="text-xs text-green-400">Đang hoạt động</p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={() => setIsMinimized(true)} className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors">
                        <Minus size={20} />
                    </button>
                    <button onClick={onClose} className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors">
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[#18191A]" onClick={() => { setShowEmoji(false); setShowGif(false); }}>
                {loading ? (
                    <div className="flex justify-center mt-10">
                        <Loader className="animate-spin text-cyan-500" size={24} />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-6 opacity-60">
                        <div className="w-20 h-20 rounded-full bg-slate-700 overflow-hidden mb-4">
                            {friend.avatarUrl ? (
                                <img src={friend.avatarUrl} alt="Avatar" className="w-full h-full object-cover grayscale" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold bg-slate-600">
                                    {friend.fullName ? friend.fullName.charAt(0).toUpperCase() : 'U'}
                                </div>
                            )}
                        </div>
                        <p className="text-gray-400 text-sm">Bắt đầu cuộc trò chuyện với {friend.fullName || friend.username}</p>
                    </div>
                ) : (
                    messages.map((msg, idx) => {
                        const isMe = msg.senderId === user.id;
                        const showAvatar = !isMe && (idx === 0 || messages[idx - 1].senderId !== msg.senderId);
                        const isImg = isImageUrl(msg.content);
                        // Show "Seen" (like Messenger) - only on my messages that friend read
                        const lastReadMeIdx = messages.map(m => m.isRead && m.senderId === user.id).lastIndexOf(true);
                        const isLastRead = isMe && idx === lastReadMeIdx;

                        return (
                            <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group gap-1`}>
                                <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} items-end gap-2 max-w-full`}>
                                    {!isMe && (
                                        <div className="w-8 h-8 flex-shrink-0 mb-1">
                                            {showAvatar ? (
                                                <div className="w-8 h-8 rounded-full bg-slate-700 overflow-hidden">
                                                    {friend.avatarUrl ? (
                                                        <img src={friend.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold bg-gradient-to-br from-blue-500 to-cyan-500">
                                                            {friend.fullName ? friend.fullName.charAt(0).toUpperCase() : 'U'}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : <div className="w-8" />}
                                        </div>
                                    )}

                                    <div className={`max-w-[75%] shadow-sm relative group-hover:shadow-md transition-shadow
                                        ${isMe
                                            ? 'bg-cyan-600 text-white rounded-2xl rounded-tr-md'
                                            : 'bg-[#3A3B3C] text-gray-100 rounded-2xl rounded-tl-md'
                                        } ${isImg ? 'p-0 overflow-hidden bg-transparent' : 'px-4 py-2'}`}>

                                        {isImg ? (
                                            <img src={msg.content} alt="GIF" className="w-full h-auto rounded-xl" />
                                        ) : (
                                            <p className="break-words leading-snug">{msg.content}</p>
                                        )}

                                        <span className={`text-[10px] opacity-0 group-hover:opacity-70 absolute -bottom-5 min-w-max transition-opacity duration-200 text-gray-400
                                            ${isMe ? 'right-0' : 'left-0'}`}>
                                            {msg.createdAt ? format(new Date(msg.createdAt), 'HH:mm') : 'Just now'}
                                        </span>
                                    </div>
                                </div>
                                {isLastRead && (
                                    <div className="flex justify-end mt-1 mr-1">
                                        <div className="w-4 h-4 rounded-full overflow-hidden border border-[#242526] shadow-sm" title={`Đã xem lúc ${format(new Date(), 'HH:mm')}`}>
                                            {friend.avatarUrl ? (
                                                <img src={friend.avatarUrl} alt="Seen" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-slate-500 flex items-center justify-center text-[8px] text-white font-bold">
                                                    {friend.fullName ? friend.fullName.charAt(0).toUpperCase() : 'U'}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-white/10 bg-[#242526] relative">
                {/* Pickers */}
                {showEmoji && (
                    <div className="absolute bottom-16 left-0 z-50">
                        <EmojiPicker onEmojiClick={onEmojiClick} theme="dark" width={300} height={400} />
                    </div>
                )}
                {showGif && (
                    <div className="absolute bottom-16 left-0 z-50 bg-[#3A3B3C] p-2 rounded-xl border border-white/10 shadow-xl w-72 h-64 overflow-y-auto custom-scrollbar grid grid-cols-2 gap-2">
                        {GIFS.map((gif, idx) => (
                            <img
                                key={idx}
                                src={gif}
                                className="w-full h-auto rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => handleSend(gif)}
                                alt="sticker"
                            />
                        ))}
                    </div>
                )}

                <div className="flex items-center gap-2">
                    <div className="flex gap-1 text-gray-400">
                        <button
                            className={`p-2 rounded-full hover:bg-white/10 transition-colors ${showEmoji ? 'text-cyan-500 bg-white/10' : ''}`}
                            onClick={() => { setShowEmoji(!showEmoji); setShowGif(false); }}
                        >
                            <Smile size={20} />
                        </button>
                        <button
                            className={`p-2 rounded-full hover:bg-white/10 transition-colors ${showGif ? 'text-cyan-500 bg-white/10' : ''}`}
                            onClick={() => { setShowGif(!showGif); setShowEmoji(false); }}
                        >
                            <ImageIcon size={20} />
                        </button>
                    </div>

                    <div className="relative flex-1">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Nhập tin nhắn..."
                            className="w-full bg-[#3A3B3C] rounded-full pl-4 pr-10 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                        />
                        <button
                            onClick={() => handleSend(newMessage)}
                            disabled={!newMessage.trim()}
                            className="absolute right-1 top-1/2 transform -translate-y-1/2 p-1.5 text-cyan-500 hover:text-cyan-400 disabled:opacity-50"
                        >
                            <Send size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatBox;
