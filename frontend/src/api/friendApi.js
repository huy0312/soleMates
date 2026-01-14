import axiosClient from './axios';

const friendApi = {
    sendRequest: (userId) => {
        return axiosClient.post(`/friends/request/${userId}`);
    },

    acceptRequest: (friendshipId) => {
        return axiosClient.put(`/friends/${friendshipId}/accept`);
    },

    getFriendshipStatus: (userId) => {
        return axiosClient.get(`/friends/status/${userId}`);
    },
};

export default friendApi;
