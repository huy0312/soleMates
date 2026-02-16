package com.solemates.backend.dto;

import com.solemates.backend.enums.Gender;
import com.solemates.backend.enums.UserRole;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;

@Data
@Builder
public class UserDTO {
    private Long id;
    private String email;
    private String username;
    private String referralCode;
    private String shareToken;
    private UserRole role;
    private String fullName;
    private Gender gender;
    private LocalDate birthDate;
    private LocalDate joinDate;
    private String avatarUrl;
    private String bio;
    private String coverPhotoUrl;
    private String address;
    private String telephone;
    private Boolean showEmail;
    private Boolean showPhone;
    private Boolean showAddress;
    private Boolean showBirthday;
    private Integer points;
    private String rank;
    private Integer nextRankThreshold;
    private Double rankProgress;
    private Long stravaId;
}
