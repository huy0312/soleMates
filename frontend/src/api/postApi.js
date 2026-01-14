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
};

export default postApi;
