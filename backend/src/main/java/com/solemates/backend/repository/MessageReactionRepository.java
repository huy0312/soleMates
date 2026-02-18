package com.solemates.backend.repository;

import com.solemates.backend.model.MessageReaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MessageReactionRepository extends JpaRepository<MessageReaction, Long> {

    @Query("SELECT r FROM MessageReaction r WHERE r.message.id = :messageId")
    List<MessageReaction> findByMessageId(@Param("messageId") Long messageId);

    @Query("SELECT r FROM MessageReaction r WHERE r.message.id = :messageId AND r.user.userId = :userId")
    Optional<MessageReaction> findByMessageIdAndUserId(@Param("messageId") Long messageId,
            @Param("userId") Long userId);

    @Modifying
    @Query("DELETE FROM MessageReaction r WHERE r.message.id = :messageId AND r.user.userId = :userId")
    void deleteByMessageIdAndUserId(@Param("messageId") Long messageId, @Param("userId") Long userId);

    @Query("SELECT r FROM MessageReaction r WHERE r.message.id IN :messageIds")
    List<MessageReaction> findByMessageIdIn(@Param("messageIds") List<Long> messageIds);
}
