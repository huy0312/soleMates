package com.solemates.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "activity")
public class Activity {

    @Id
    private Long activityId; // From Strava

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id")
    private MemberProfile memberProfile;

    private String name;

    private Double distance;

    private Integer movingTime;

    private Double averagePace;

    private LocalDateTime startTime;
}
