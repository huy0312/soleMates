package com.solemates.backend.repository;

import com.solemates.backend.model.Message;
import com.solemates.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findBySenderAndReceiverOrReceiverAndSenderOrderByCreatedAtAsc(User sender1, User receiver1,
            User receiver2, User sender2);

    @Modifying
    @Query("UPDATE Message m SET m.isRead = true WHERE m.sender.userId = :senderId AND m.receiver.userId = :receiverId AND m.isRead = false")
    void markMessagesAsRead(Long senderId, Long receiverId);
}
