package com.solemates.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatePostRequest {
    private String content;
    private String imageUrl;
    private Long activityId; // Strava Activity ID
}
