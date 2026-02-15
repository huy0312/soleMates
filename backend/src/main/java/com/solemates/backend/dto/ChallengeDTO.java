package com.solemates.backend.dto;

import java.time.LocalDateTime;
import com.solemates.backend.enums.ChallengeStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChallengeDTO {
    private Long id;
    private String title;
    private String subTitle;
    private String description;
    private String imageUrl;
    private LocalDateTime startDate; // Changed from LocalDate
    private LocalDateTime endDate; // Changed from LocalDate
    private Double goal;
    private String unit;
    private ChallengeStatus status;
    private Integer participantsCount;
    private java.util.List<ChallengeOptionDTO> options;
    private String distances;
    private String completionTime;
    private LocalDateTime registrationDeadline; // Changed from LocalDate
    private String activityTypes;
    private String bibUrl;
    private String rules;
}
