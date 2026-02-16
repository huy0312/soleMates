package com.solemates.backend.repository;

import com.solemates.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    Optional<User> findByUsername(String username);

    Optional<User> findByReferralCode(String referralCode);

    @org.springframework.data.jpa.repository.Query("SELECT u FROM User u WHERE u.username LIKE %:keyword% OR u.fullName LIKE %:keyword% OR u.referralCode = :keyword")
    java.util.List<User> searchUsers(@org.springframework.data.repository.query.Param("keyword") String keyword);

}
