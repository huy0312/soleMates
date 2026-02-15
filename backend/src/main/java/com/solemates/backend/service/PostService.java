package com.solemates.backend.service;

import com.solemates.backend.dto.CreatePostRequest;
import com.solemates.backend.dto.PostDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface PostService {
    PostDTO createPost(CreatePostRequest request, String userEmail);

    List<PostDTO> getAllPosts();

    Page<PostDTO> getAllPosts(Pageable pageable);

    void deletePost(Long postId, String userEmail);

    PostDTO toggleLike(Long postId, String userEmail);

    com.solemates.backend.dto.CommentDTO addComment(Long postId, String content, String userEmail);

    org.springframework.data.domain.Page<com.solemates.backend.dto.CommentDTO> getComments(Long postId,
            Pageable pageable);
}
