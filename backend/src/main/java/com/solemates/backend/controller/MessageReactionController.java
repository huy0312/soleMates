package com.solemates.backend.controller;

import com.solemates.backend.model.Message;
import com.solemates.backend.model.MessageReaction;
import com.solemates.backend.model.User;
import com.solemates.backend.repository.MessageReactionRepository;
import com.solemates.backend.repository.MessageRepository;
import com.solemates.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageReactionController {

    private final MessageReactionRepository reactionRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    // GET reactions for a message
    @GetMapping("/{messageId}/reactions")
    public ResponseEntity<List<Map<String, Object>>> getReactions(@PathVariable Long messageId) {
        List<MessageReaction> reactions = reactionRepository.findByMessageId(messageId);
        List<Map<String, Object>> result = reactions.stream().map(r -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", r.getId());
            map.put("emoji", r.getEmoji());
            map.put("userId", r.getUser().getUserId());
            return map;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    // Toggle reaction (add or remove)
    @PostMapping("/{messageId}/reactions")
    @Transactional
    public ResponseEntity<Map<String, Object>> toggleReaction(
            @PathVariable Long messageId,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserDetails userDetails) {

        String emoji = body.get("emoji");
        User currentUser = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));

        Optional<MessageReaction> existing = reactionRepository
                .findByMessageIdAndUserId(messageId, currentUser.getUserId());

        Map<String, Object> response = new HashMap<>();
        response.put("messageId", messageId);
        response.put("userId", currentUser.getUserId());

        if (existing.isPresent()) {
            if (existing.get().getEmoji().equals(emoji)) {
                // Same emoji → remove reaction
                reactionRepository.delete(existing.get());
                response.put("action", "removed");
                response.put("emoji", emoji);
            } else {
                // Different emoji → update reaction
                existing.get().setEmoji(emoji);
                reactionRepository.save(existing.get());
                response.put("action", "updated");
                response.put("emoji", emoji);
            }
        } else {
            // New reaction
            MessageReaction reaction = MessageReaction.builder()
                    .message(message)
                    .user(currentUser)
                    .emoji(emoji)
                    .build();
            reactionRepository.save(reaction);
            response.put("action", "added");
            response.put("emoji", emoji);
        }

        // Broadcast to both sender and receiver via WebSocket
        Long senderId = message.getSender().getUserId();
        Long receiverId = message.getReceiver().getUserId();
        messagingTemplate.convertAndSend("/topic/reactions/" + senderId, (Object) response);
        messagingTemplate.convertAndSend("/topic/reactions/" + receiverId, (Object) response);

        return ResponseEntity.ok(response);
    }

    // GET all reactions for a list of message IDs (batch)
    @PostMapping("/reactions/batch")
    public ResponseEntity<Map<Long, List<Map<String, Object>>>> getReactionsBatch(
            @RequestBody List<Long> messageIds) {
        List<MessageReaction> reactions = reactionRepository.findByMessageIdIn(messageIds);
        Map<Long, List<Map<String, Object>>> result = reactions.stream()
                .collect(Collectors.groupingBy(
                        r -> r.getMessage().getId(),
                        Collectors.mapping(r -> {
                            Map<String, Object> map = new HashMap<>();
                            map.put("emoji", r.getEmoji());
                            map.put("userId", r.getUser().getUserId());
                            return map;
                        }, Collectors.toList())));
        return ResponseEntity.ok(result);
    }
}
