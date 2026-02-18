package com.solemates.backend.controller;

import com.solemates.backend.model.Message;
import com.solemates.backend.model.User;
import com.solemates.backend.repository.MessageRepository;
import com.solemates.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.ResponseBody;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Controller
@RequiredArgsConstructor
public class ChatController {

        private final SimpMessagingTemplate messagingTemplate;
        private final MessageRepository messageRepository;
        private final UserRepository userRepository;

        @MessageMapping("/chat")
        public void processMessage(@Payload Map<String, Object> payload) {
                String senderId = String.valueOf(payload.get("senderId"));
                String receiverId = String.valueOf(payload.get("receiverId"));
                String content = (String) payload.get("content");

                User sender = userRepository.findById(Long.parseLong(senderId))
                                .orElseThrow(() -> new RuntimeException("Sender not found"));
                User receiver = userRepository.findById(Long.parseLong(receiverId))
                                .orElseThrow(() -> new RuntimeException("Receiver not found"));

                Message message = Message.builder()
                                .sender(sender)
                                .receiver(receiver)
                                .content(content)
                                .isRead(false)
                                .build();

                // Manual setting of createdAt since @CreatedDate might not work without saving
                // effectively in some contexts,
                // but here we save immediately.
                message.setCreatedAt(LocalDateTime.now());

                Message saved = messageRepository.save(message);

                // Prepare response DTO
                Map<String, Object> response = new HashMap<>();
                response.put("id", saved.getId());
                response.put("content", saved.getContent());
                response.put("senderId", sender.getUserId());
                response.put("receiverId", receiver.getUserId());
                response.put("createdAt", saved.getCreatedAt());
                response.put("senderName",
                                sender.getStatus() != null
                                                /* check something to avoid null */ ? (sender.getMemberProfile() != null
                                                                ? sender.getMemberProfile().getFullName()
                                                                : sender.getUsername())
                                                : sender.getUsername());

                // Send to receiver
                messagingTemplate.convertAndSend("/topic/messages/" + receiver.getUserId(), (Object) response);

                // Return to sender (for confirmation/update if needed, though usually frontend
                // optimistic updates)
                // logic usually handles this, but we can send back to sender's queue too if
                // enabling multiple devices
        }

        @GetMapping("/api/messages/{userId}")
        @ResponseBody
        public ResponseEntity<List<Map<String, Object>>> getChatHistory(
                        @PathVariable Long userId,
                        @AuthenticationPrincipal UserDetails userDetails) {

                User currentUser = userRepository.findByEmail(userDetails.getUsername())
                                .orElseThrow(() -> new RuntimeException("User not found"));
                User otherUser = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                List<Message> messages = messageRepository
                                .findBySenderAndReceiverOrReceiverAndSenderOrderByCreatedAtAsc(
                                                currentUser, otherUser, currentUser, otherUser);

                List<Map<String, Object>> history = messages.stream().map(m -> {
                        Map<String, Object> map = new HashMap<>();
                        map.put("id", m.getId());
                        map.put("content", m.getContent());
                        map.put("senderId", m.getSender().getUserId());
                        map.put("receiverId", m.getReceiver().getUserId());
                        map.put("createdAt", m.getCreatedAt());
                        return map;
                }).collect(Collectors.toList());

                return ResponseEntity.ok(history);
        }

        @MessageMapping("/seen")
        @Transactional
        public void markRead(@Payload Map<String, Object> payload) {
                Long senderId = Long.parseLong(String.valueOf(payload.get("senderId"))); // Friend who sent messages
                Long receiverId = Long.parseLong(String.valueOf(payload.get("receiverId"))); // Me who read them

                messageRepository.markMessagesAsRead(senderId, receiverId);

                // Notify the sender (friend) that I read their messages
                Map<String, Object> receipt = new HashMap<>();
                receipt.put("type", "READ_RECEIPT");
                receipt.put("readerId", receiverId);

                messagingTemplate.convertAndSend("/topic/messages/" + senderId, (Object) receipt);
        }

        @GetMapping("/api/messages/unread-count")
        @ResponseBody
        public ResponseEntity<Map<String, Long>> getUnreadCount(@AuthenticationPrincipal UserDetails userDetails) {
                User currentUser = userRepository.findByEmail(userDetails.getUsername())
                                .orElseThrow(() -> new RuntimeException("User not found"));

                long count = messageRepository.countByReceiverAndIsReadFalse(currentUser);

                Map<String, Long> response = new HashMap<>();
                response.put("count", count);

                return ResponseEntity.ok(response);
        }

        @GetMapping("/api/messages/conversations")
        @ResponseBody
        public ResponseEntity<List<Map<String, Object>>> getRecentConversations(
                        @AuthenticationPrincipal UserDetails userDetails) {
                User currentUser = userRepository.findByEmail(userDetails.getUsername())
                                .orElseThrow(() -> new RuntimeException("User not found"));

                List<Message> recentMessages = messageRepository.findRecentConversations(currentUser.getUserId());

                List<Map<String, Object>> conversations = recentMessages.stream().map(msg -> {
                        Map<String, Object> map = new HashMap<>();
                        User otherUser = msg.getSender().getUserId().equals(currentUser.getUserId()) ? msg.getReceiver()
                                        : msg.getSender();

                        map.put("partnerId", otherUser.getUserId());
                        map.put("partnerName",
                                        otherUser.getMemberProfile() != null
                                                        ? otherUser.getMemberProfile().getFullName()
                                                        : otherUser.getUsername());
                        map.put("partnerAvatar",
                                        otherUser.getMemberProfile() != null
                                                        ? otherUser.getMemberProfile().getAvatarUrl()
                                                        : null);
                        map.put("lastMessage", msg.getContent());
                        map.put("lastMessageId", msg.getId());
                        map.put("createdAt", msg.getCreatedAt());
                        map.put("isRead", msg.isRead());
                        map.put("amISender", msg.getSender().getUserId().equals(currentUser.getUserId()));

                        return map;
                }).collect(Collectors.toList());

                return ResponseEntity.ok(conversations);
        }
}
