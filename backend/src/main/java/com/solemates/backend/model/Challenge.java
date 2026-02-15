package com.solemates.backend.model;

import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.solemates.backend.enums.ChallengeStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "challenges")
public class Challenge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String subTitle;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String imageUrl;

    private LocalDateTime startDate;
    private LocalDateTime endDate;

    private Double goal; // e.g., 50.0
    private String unit; // e.g., "km"

    @Enumerated(EnumType.STRING)
    private ChallengeStatus status;

    private Integer participantsCount; // to show how many joined

    // Enhanced fields
    @OneToMany(mappedBy = "challenge", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<ChallengeOption> options;

    private String distances; // comma separated: "5km, 10km"
    private String completionTime; // "30 days"
    private LocalDateTime registrationDeadline;
    private String activityTypes; // "Run,Walk,Ride,Swim"

    @Column(columnDefinition = "TEXT")
    private String bibUrl;

    @Column(columnDefinition = "TEXT")
    private String rules;
}
