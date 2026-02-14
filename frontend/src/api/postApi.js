import axiosClient from './axios';

const postApi = {
    getAllPosts: (page = 0, size = 10) => {
        return axiosClient.get('/posts', {
            params: { page, size },
        });
    },

    createPost: (data) => {
        return axiosClient.post('/posts', data);
    },

    deletePost: (id) => {
        return axiosClient.delete(`/posts/${id}`);
    },

    toggleLike: (id) => {
        return axiosClient.post(`/posts/${id}/like`);
    },

    addComment: (postId, content) => {
        return axiosClient.post(`/posts/${postId}/comments`, content, {
            headers: { 'Content-Type': 'text/plain' }
        });
    },

    getComments: (postId, page = 0, size = 10) => {
        return axiosClient.get(`/posts/${postId}/comments`, {
            params: { page, size }
        });
    },

    getStravaActivities: (year, page = 1) => {
        return axiosClient.get('/strava/activities', {
            params: { year, page }
        });
    },
};

export default postApi;
