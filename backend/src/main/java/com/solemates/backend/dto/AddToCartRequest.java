package com.solemates.backend.dto;

import lombok.Data;

@Data
public class AddToCartRequest {
    private Long userId; // Optional if we get user from context, but helpful for testing or explicit
                         // flows
    private Long optionId;
    private int quantity = 1;
}
