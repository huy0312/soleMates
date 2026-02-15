package com.solemates.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "strava_account")
public class StravaAccount {

    @Id
    private Long stravaId; // Not auto-generated, comes from Strava

    @OneToOne
    @JoinColumn(name = "member_id", unique = true)
    private MemberProfile memberProfile;

    private String accessToken;

    private String refreshToken;

    private Long expiresAt;
}
