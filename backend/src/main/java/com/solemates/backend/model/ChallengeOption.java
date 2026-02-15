package com.solemates.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
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
@Table(name = "challenge_options")
public class ChallengeOption {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name; // e.g. "Basic", "Premium"

    @Column(columnDefinition = "TEXT")
    private String description; // e.g. "Medal + Shirt + E-Cert"

    private Double price;
    private Double originalPrice;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "challenge_id")
    @JsonIgnore
    private Challenge challenge;
}
