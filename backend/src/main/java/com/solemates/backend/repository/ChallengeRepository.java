package com.solemates.backend.repository;

import com.solemates.backend.model.Challenge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ChallengeRepository extends JpaRepository<Challenge, Long>, JpaSpecificationExecutor<Challenge> {
    List<Challenge> findAllByEndDateAfter(LocalDateTime date);
}
