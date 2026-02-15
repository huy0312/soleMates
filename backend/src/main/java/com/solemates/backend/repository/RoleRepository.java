package com.solemates.backend.repository;

import com.solemates.backend.model.Role;
import com.solemates.backend.enums.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Integer> {
    Optional<Role> findByRoleName(UserRole roleName);
}
