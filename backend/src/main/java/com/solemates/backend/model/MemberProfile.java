package com.solemates.backend.model;

import com.solemates.backend.enums.Gender;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "member_profile")
public class MemberProfile extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long memberId;

    @OneToOne
    @JoinColumn(name = "user_id", unique = true)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private User user;

    private String fullName;

    @Enumerated(EnumType.STRING)
    private Gender gender;

    private LocalDate birthDate;

    @Column(columnDefinition = "TEXT")
    private String avatarUrl;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(columnDefinition = "TEXT")
    private String coverPhotoUrl;

    private String address;
    private String telephone;

    @Builder.Default
    private Boolean showEmail = false;

    @Builder.Default
    private Boolean showPhone = false;

    @Builder.Default
    private Boolean showAddress = false;

    @Builder.Default
    private Boolean showBirthday = false;

    @Builder.Default
    private Integer points = 0;
}
