package com.solemates.backend.controller;

import com.solemates.backend.dto.CreatePostRequest;
import com.solemates.backend.dto.PostDTO;
import com.solemates.backend.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    @PostMapping
    public ResponseEntity<PostDTO> createPost(
            @RequestBody CreatePostRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(postService.createPost(request, userDetails.getUsername()));
    }

    @GetMapping
    public ResponseEntity<Page<PostDTO>> getAllPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(postService.getAllPosts(pageable));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        postService.deletePost(id, userDetails.getUsername());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<PostDTO> toggleLike(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(postService.toggleLike(id, userDetails.getUsername()));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<com.solemates.backend.dto.CommentDTO> addComment(
            @PathVariable Long id,
            @RequestBody String content,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(postService.addComment(id, content, userDetails.getUsername()));
    }

    @GetMapping("/{id}/comments")
    public ResponseEntity<Page<com.solemates.backend.dto.CommentDTO>> getComments(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(postService.getComments(id, pageable));
    }
}
