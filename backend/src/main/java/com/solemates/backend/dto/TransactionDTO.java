package com.solemates.backend.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TransactionDTO {
    private Long userId;
    private Long challengeOptionId;
    private Double amount;
    private String status;
    private String paymentMethod;
}
