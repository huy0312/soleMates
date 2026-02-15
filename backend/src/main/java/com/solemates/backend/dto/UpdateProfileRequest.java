package com.solemates.backend.dto;

import com.solemates.backend.enums.Gender;
import java.time.LocalDate;
import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String fullName;
    private Gender gender;
    private LocalDate birthDate;
    private String bio;
    private String avatarUrl;
    private String coverPhotoUrl;
    private String address;
    private String telephone;
    private Boolean showEmail;
    private Boolean showPhone;
    private Boolean showAddress;
    private Boolean showBirthday;
}
