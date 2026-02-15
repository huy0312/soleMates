package com.solemates.backend.repository;

import com.solemates.backend.model.MemberProfile;
import com.solemates.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MemberProfileRepository extends JpaRepository<MemberProfile, Long> {
    Optional<MemberProfile> findByUser(User user);
}
