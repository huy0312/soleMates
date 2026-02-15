package com.solemates.backend.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.solemates.backend.dto.ActivityDTO;
import com.solemates.backend.dto.CreatePostRequest;
import com.solemates.backend.dto.PostDTO;
import com.solemates.backend.dto.UserDTO;
import com.solemates.backend.model.Activity;
import com.solemates.backend.model.Post;
import com.solemates.backend.model.User;
import com.solemates.backend.repository.ActivityRepository;
import com.solemates.backend.repository.PostRepository;
import com.solemates.backend.repository.UserRepository;
import com.solemates.backend.service.PostService;
import com.solemates.backend.service.StravaService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PostServiceImpl implements PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final ActivityRepository activityRepository;
    private final StravaService stravaService;
    private final com.solemates.backend.repository.CommentRepository commentRepository;
    private final com.solemates.backend.repository.PostLikeRepository postLikeRepository;

    @Override
    @Transactional
    public PostDTO createPost(CreatePostRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Activity activity = null;
        if (request.getActivityId() != null) {
            // Check if activity exists in DB
            activity = activityRepository.findById(request.getActivityId()).orElse(null);

            // If not, fetch from Strava and save
            if (activity == null) {
                try {
                    JsonNode stravaActivity = stravaService.getActivity(request.getActivityId());
                    activity = mapToActivityEntity(stravaActivity, user);
                    activityRepository.save(activity);
                } catch (Exception e) {
                    throw new RuntimeException("Could not fetch or save Strava activity: " + e.getMessage());
                }
            }
        }

        Post post = Post.builder()
                .content(request.getContent())
                .imageUrl(request.getImageUrl())
                .user(user)
                .activity(activity)
                .likesCount(0)
                .commentsCount(0)
                .build();

        post = postRepository.save(post);
        return mapToDTO(post);
    }

    @Override
    public List<PostDTO> getAllPosts() {
        return postRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Page<PostDTO> getAllPosts(Pageable pageable) {
        return postRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(this::mapToDTO);
    }

    @Override
    @Transactional
    public void deletePost(Long postId, String userEmail) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        if (!post.getUser().getEmail().equals(userEmail)) {
            throw new RuntimeException("You are not authorized to delete this post");
        }

        postRepository.delete(post);
    }

    @Override
    @Transactional
    public PostDTO toggleLike(Long postId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        java.util.Optional<com.solemates.backend.model.PostLike> existingLike = postLikeRepository
                .findByUserUserIdAndPostId(user.getUserId(), postId);

        if (existingLike.isPresent()) {
            postLikeRepository.delete(existingLike.get());
            post.setLikesCount(Math.max(0, post.getLikesCount() - 1));
        } else {
            com.solemates.backend.model.PostLike like = com.solemates.backend.model.PostLike.builder()
                    .user(user)
                    .post(post)
                    .build();
            postLikeRepository.save(like);
            post.setLikesCount(post.getLikesCount() + 1);
        }

        postRepository.save(post);
        return mapToDTO(post, user);
    }

    @Override
    @Transactional
    public com.solemates.backend.dto.CommentDTO addComment(Long postId, String content, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        com.solemates.backend.model.Comment comment = com.solemates.backend.model.Comment.builder()
                .content(content)
                .user(user)
                .post(post)
                .build();

        commentRepository.save(comment);

        post.setCommentsCount(post.getCommentsCount() + 1);
        postRepository.save(post);

        return mapToCommentDTO(comment);
    }

    @Override
    public Page<com.solemates.backend.dto.CommentDTO> getComments(Long postId, Pageable pageable) {
        return commentRepository.findByPostIdOrderByCreatedAtDesc(postId, pageable)
                .map(this::mapToCommentDTO);
    }

    private com.solemates.backend.dto.CommentDTO mapToCommentDTO(com.solemates.backend.model.Comment comment) {
        String fullName = "Unknown User";
        String avatarUrl = null;
        if (comment.getUser().getMemberProfile() != null) {
            fullName = comment.getUser().getMemberProfile().getFullName();
            avatarUrl = comment.getUser().getMemberProfile().getAvatarUrl();
        }

        UserDTO userDTO = UserDTO.builder()
                .id(comment.getUser().getUserId())
                .fullName(fullName)
                .email(comment.getUser().getEmail())
                .avatarUrl(avatarUrl)
                .stravaId(comment.getUser().getStravaId())
                .build();

        return com.solemates.backend.dto.CommentDTO.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .user(userDTO)
                .createdAt(comment.getCreatedAt())
                .build();
    }

    // Overload mapToDTO to support checking if liked by specific user
    private PostDTO mapToDTO(Post post, User currentUser) {
        PostDTO dto = mapToDTO(post);
        if (currentUser != null) {
            boolean isLiked = postLikeRepository.existsByUserUserIdAndPostId(currentUser.getUserId(), post.getId());
            dto.setLikedByCurrentUser(isLiked);
        } else {
            dto.setLikedByCurrentUser(false);
        }
        return dto;
    }

    private PostDTO mapToDTO(Post post) {
        String fullName = "Unknown User";
        String avatarUrl = null;
        if (post.getUser().getMemberProfile() != null) {
            fullName = post.getUser().getMemberProfile().getFullName();
            avatarUrl = post.getUser().getMemberProfile().getAvatarUrl();
        }

        UserDTO userDTO = UserDTO.builder()
                .id(post.getUser().getUserId())
                .fullName(fullName)
                .email(post.getUser().getEmail())
                .avatarUrl(avatarUrl)
                .stravaId(post.getUser().getStravaId())
                .build();

        ActivityDTO activityDTO = null;
        if (post.getActivity() != null) {
            activityDTO = ActivityDTO.builder()
                    .activityId(post.getActivity().getActivityId())
                    .name(post.getActivity().getName())
                    .distance(post.getActivity().getDistance())
                    .movingTime(post.getActivity().getMovingTime())
                    .averagePace(post.getActivity().getAveragePace())
                    .startTime(post.getActivity().getStartTime())
                    .build();
        }

        // Check authentication context for current user to set likedByCurrentUser
        boolean likedByCurrentUser = false;
        try {
            org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder
                    .getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
                String email = ((org.springframework.security.core.userdetails.UserDetails) auth.getPrincipal())
                        .getUsername();
                User user = userRepository.findByEmail(email).orElse(null);
                if (user != null) {
                    likedByCurrentUser = postLikeRepository.existsByUserUserIdAndPostId(user.getUserId(), post.getId());
                }
            }
        } catch (Exception e) {
            // Ignore if no context
        }

        return PostDTO.builder()
                .id(post.getId())
                .content(post.getContent())
                .imageUrl(post.getImageUrl())
                .user(userDTO)
                .activity(activityDTO)
                .likesCount(post.getLikesCount())
                .commentsCount(post.getCommentsCount())
                .likedByCurrentUser(likedByCurrentUser)
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .build();
    }

    private Activity mapToActivityEntity(JsonNode node, User user) {
        Activity.ActivityBuilder builder = Activity.builder();

        builder.activityId(node.get("id").asLong());
        if (user.getMemberProfile() != null) {
            builder.memberProfile(user.getMemberProfile());
        }
        builder.name(node.get("name").asText());
        builder.distance(node.get("distance").asDouble());
        builder.movingTime(node.get("moving_time").asInt());

        String startDate = node.get("start_date_local").asText();
        try {
            builder.startTime(LocalDateTime.parse(startDate, DateTimeFormatter.ISO_DATE_TIME));
        } catch (Exception e) {
            builder.startTime(LocalDateTime.now());
        }

        builder.averagePace(node.path("average_speed").asDouble());

        return builder.build();
    }
}
