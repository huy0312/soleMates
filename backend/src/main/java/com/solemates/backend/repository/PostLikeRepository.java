package com.solemates.backend.repository;

import com.solemates.backend.model.PostLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PostLikeRepository extends JpaRepository<PostLike, Long> {
    Optional<PostLike> findByUserUserIdAndPostId(Long userId, Long postId);

    boolean existsByUserUserIdAndPostId(Long userId, Long postId);

    long countByPostId(Long postId);
}
