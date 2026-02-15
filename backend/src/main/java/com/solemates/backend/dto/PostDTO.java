package com.solemates.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostDTO {
    private Long id;
    private String content;
    private String imageUrl;
    private UserDTO user;
    private ActivityDTO activity; // You might need to create this if it doesn't exist, or use a simplified object
    private Integer likesCount;
    private Integer commentsCount;
    private Boolean likedByCurrentUser;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
