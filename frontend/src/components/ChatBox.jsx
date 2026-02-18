import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Loader, Minus, Smile, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import chatApi from '../api/chatApi';
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

const ChatBox = ({ friend, onClose, onMessageRead }) => {
    // ... existing state ...

    // ... existing effects ...


    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [isMinimized, setIsMinimized] = useState(false);
    const [showEmoji, setShowEmoji] = useState(false);
    const [showGif, setShowGif] = useState(false);
    const [reactions, setReactions] = useState({}); // { messageId: { emoji, userId } }
    const [hoveredMsg, setHoveredMsg] = useState(null);
    const hoverTimeoutRef = useRef(null);
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
            const msgs = res.data;
            setMessages(msgs);
            // Fetch reactions for all messages in batch
            if (msgs.length > 0) {
                const ids = msgs.map(m => m.id).filter(Boolean);
                if (ids.length > 0) {
                    const rxRes = await chatApi.getReactionsBatch(ids);
                    // rxRes.data: { messageId: [{emoji, userId}] }
                    const rxMap = {};
                    Object.entries(rxRes.data).forEach(([msgId, rxList]) => {
                        rxList.forEach(rx => { rxMap[msgId] = rx; }); // last one wins per message
                    });
                    setReactions(rxMap);
                }
            }
        } catch (error) {
            console.error("Failed to fetch chat history", error);
        } finally {
            setLoading(false);
        }
    };

    const playNotificationSound = () => {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(880, ctx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1);
            gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + 0.3);
        } catch (e) { /* ignore */ }
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
                } else if (receivedMsg.senderId === friend.id) {
                    setMessages(prev => {
                        if (prev.some(m => m.id === receivedMsg.id)) return prev;
                        return [...prev, receivedMsg];
                    });
                    playNotificationSound();
                    markAsRead();
                }
            });

            // Subscribe to reaction updates
            client.subscribe(`/topic/reactions/${user.id}`, (message) => {
                const rx = JSON.parse(message.body);
                const msgId = String(rx.messageId);
                setReactions(prev => {
                    const updated = { ...prev };
                    if (rx.action === 'removed') {
                        delete updated[msgId];
                    } else {
                        updated[msgId] = { emoji: rx.emoji, userId: rx.userId };
                    }
                    return updated;
                });
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
            if (onMessageRead) onMessageRead();
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
                            <div
                                key={idx}
                                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} gap-1`}
                                style={{ marginBottom: reactions[String(msg.id)] ? '18px' : '4px', position: 'relative' }}
                                onMouseEnter={() => {
                                    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
                                    setHoveredMsg(idx);
                                }}
                                onMouseLeave={() => {
                                    hoverTimeoutRef.current = setTimeout(() => setHoveredMsg(null), 200);
                                }}
                            >
                                <div style={{ display: 'flex', flexDirection: isMe ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: '8px', width: '100%', position: 'relative' }}>
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

                                    <div style={{
                                        maxWidth: '75%',
                                        boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                                        position: 'relative',
                                        borderRadius: isMe ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
                                        backgroundColor: isMe ? '#0891b2' : '#3A3B3C',
                                        color: isMe ? 'white' : '#f3f4f6',
                                        padding: isImg ? '0' : '8px 14px',
                                        overflow: isImg ? 'hidden' : 'visible',
                                        wordBreak: 'break-word',
                                        overflowWrap: 'break-word',
                                    }}>

                                        {isImg ? (
                                            <img src={msg.content} alt="GIF" className="w-full h-auto rounded-xl" />
                                        ) : (
                                            <p style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>{msg.content}</p>
                                        )}

                                        <span style={{
                                            fontSize: '10px',
                                            position: 'absolute',
                                            bottom: '-20px',
                                            [isMe ? 'right' : 'left']: '0',
                                            whiteSpace: 'nowrap',
                                            color: '#9ca3af',
                                            opacity: hoveredMsg === idx ? 0.7 : 0,
                                            transition: 'opacity 0.2s',
                                        }}>
                                            {msg.createdAt ? format(new Date(msg.createdAt), 'HH:mm') : 'Just now'}
                                        </span>

                                        {/* Reaction badge */}
                                        {reactions[String(msg.id)] && (
                                            <div
                                                onClick={() => chatApi.toggleReaction(msg.id, reactions[String(msg.id)].emoji)}
                                                style={{
                                                    position: 'absolute',
                                                    bottom: '-18px',
                                                    [isMe ? 'left' : 'right']: '4px',
                                                    background: '#3A3B3C',
                                                    borderRadius: '12px',
                                                    padding: '1px 6px',
                                                    fontSize: '14px',
                                                    cursor: 'pointer',
                                                    border: '1.5px solid #242526',
                                                    boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
                                                    zIndex: 1,
                                                }}
                                            >
                                                {reactions[String(msg.id)].emoji}
                                            </div>
                                        )}
                                    </div>

                                    {/* Hover reaction bar - absolutely positioned to avoid layout shift */}
                                    {hoveredMsg === idx && (
                                        <div style={{
                                            position: 'absolute',
                                            bottom: '100%',
                                            [isMe ? 'right' : 'left']: '0',
                                            marginBottom: '4px',
                                            display: 'flex',
                                            gap: '2px',
                                            background: '#3A3B3C',
                                            borderRadius: '20px',
                                            padding: '4px 8px',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            zIndex: 10,
                                            whiteSpace: 'nowrap',
                                        }}>
                                            {['❤️', '😂', '😮', '😢', '😡', '👍'].map(emoji => (
                                                <button
                                                    key={emoji}
                                                    onClick={() => msg.id && chatApi.toggleReaction(msg.id, emoji)}
                                                    style={{
                                                        fontSize: '18px',
                                                        background: 'none',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        padding: '2px',
                                                        borderRadius: '50%',
                                                        transition: 'transform 0.15s',
                                                        transform: reactions[String(msg.id)]?.emoji === emoji ? 'scale(1.3)' : 'scale(1)',
                                                        lineHeight: 1,
                                                    }}
                                                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.4)'}
                                                    onMouseLeave={e => e.currentTarget.style.transform = reactions[String(msg.id)]?.emoji === emoji ? 'scale(1.3)' : 'scale(1)'}
                                                >
                                                    {emoji}
                                                </button>
                                            ))}
                                        </div>
                                    )}
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
