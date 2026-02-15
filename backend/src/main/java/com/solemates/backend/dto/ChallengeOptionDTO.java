package com.solemates.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChallengeOptionDTO {
    private Long id;
    private String name;
    private String description;
    private Double price;
    private Double originalPrice;
}
