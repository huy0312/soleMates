package com.solemates.backend.repository;

import com.solemates.backend.model.ChallengeOption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChallengeOptionRepository extends JpaRepository<ChallengeOption, Long> {
}
