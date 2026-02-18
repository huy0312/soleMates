import api from './axios';

const chatApi = {
    getUnreadCount: () => api.get('/messages/unread-count'),
    getConversations: () => api.get('/messages/conversations'),
    toggleReaction: (messageId, emoji) => api.post(`/messages/${messageId}/reactions`, { emoji }),
    getReactionsBatch: (messageIds) => api.post('/messages/reactions/batch', messageIds),
};

export default chatApi;
