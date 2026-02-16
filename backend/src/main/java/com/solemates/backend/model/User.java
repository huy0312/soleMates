package com.solemates.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Data
@EqualsAndHashCode(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "users")
public class User extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(unique = true)
    private String username;

    @Column(unique = true)
    private String referralCode;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "role_id")
    private Role role;

    @Builder.Default
    private Boolean status = true;

    // Strava Integration
    private Long stravaId;
    private String stravaAccessToken;
    private String stravaRefreshToken;
    private Long stravaTokenExpiresAt;
    private String stravaProfileUrl;

    @OneToOne(mappedBy = "user")
    private MemberProfile memberProfile;
}
