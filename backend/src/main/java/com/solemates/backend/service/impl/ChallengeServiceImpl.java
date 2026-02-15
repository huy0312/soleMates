package com.solemates.backend.service.impl;

import com.solemates.backend.dto.ChallengeDTO;
import com.solemates.backend.dto.ChallengeOptionDTO;
import com.solemates.backend.enums.ChallengeStatus;
import com.solemates.backend.model.Challenge;
import com.solemates.backend.model.ChallengeOption;
import com.solemates.backend.repository.ChallengeRepository;
import com.solemates.backend.service.ChallengeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChallengeServiceImpl implements ChallengeService {

    private final ChallengeRepository challengeRepository;

    @Override
    public ChallengeDTO createChallenge(ChallengeDTO dto) {
        LocalDateTime now = LocalDateTime.now();

        if (dto.getRegistrationDeadline() != null && dto.getRegistrationDeadline().isBefore(now)) {
            throw new IllegalArgumentException("Hạn đăng ký không được ở trong quá khứ");
        }
        if (dto.getStartDate() != null && dto.getStartDate().isBefore(now)) {
            throw new IllegalArgumentException("Ngày bắt đầu không được ở trong quá khứ");
        }
        if (dto.getEndDate() != null && dto.getEndDate().isBefore(now)) {
            throw new IllegalArgumentException("Ngày kết thúc không được ở trong quá khứ");
        }

        // Optional: Ensure logic sequence (Start > Registration, End > Start)
        if (dto.getStartDate() != null && dto.getRegistrationDeadline() != null
                && dto.getStartDate().isBefore(dto.getRegistrationDeadline())) {
            throw new IllegalArgumentException("Ngày bắt đầu sự kiện phải sau hạn đăng ký");
        }
        if (dto.getEndDate() != null && dto.getStartDate() != null
                && dto.getEndDate().isBefore(dto.getStartDate())) {
            throw new IllegalArgumentException("Ngày kết thúc phải sau ngày bắt đầu");
        }

        Challenge challenge = Challenge.builder()
                .title(dto.getTitle())
                .subTitle(dto.getSubTitle())
                .description(dto.getDescription())
                .imageUrl(dto.getImageUrl())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .goal(dto.getGoal())
                .unit(dto.getUnit())
                .status(determineStatus(dto.getStartDate(), dto.getEndDate()))
                .participantsCount(0)
                .distances(dto.getDistances())
                .completionTime(dto.getCompletionTime())
                .registrationDeadline(dto.getRegistrationDeadline())
                .activityTypes(dto.getActivityTypes())
                .bibUrl(dto.getBibUrl())
                .rules(dto.getRules())
                .build();

        if (dto.getOptions() != null) {
            java.util.List<ChallengeOption> options = dto.getOptions().stream()
                    .map(optDto -> ChallengeOption.builder()
                            .name(optDto.getName())
                            .description(optDto.getDescription())
                            .price(optDto.getPrice())
                            .originalPrice(optDto.getOriginalPrice())
                            .challenge(challenge)
                            .build())
                    .collect(Collectors.toList());
            challenge.setOptions(options);
        }

        Challenge saved = challengeRepository.save(challenge);
        return mapToDTO(saved);
    }

    @Override
    public List<ChallengeDTO> getAllChallenges(boolean includeExpired) {
        List<Challenge> challenges;
        if (includeExpired) {
            challenges = challengeRepository.findAll();
        } else {
            challenges = challengeRepository.findAllByEndDateAfter(LocalDateTime.now());
        }
        return challenges.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ChallengeDTO getChallengeById(Long id) {
        Challenge challenge = challengeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Challenge not found"));
        return mapToDTO(challenge);
    }

    @Override
    public com.solemates.backend.dto.PageResponse<ChallengeDTO> getChallenges(int page, int size, String search,
            String status) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size,
                org.springframework.data.domain.Sort.by("startDate").descending());

        org.springframework.data.jpa.domain.Specification<Challenge> spec = org.springframework.data.jpa.domain.Specification
                .where((org.springframework.data.jpa.domain.Specification<Challenge>) null);

        if (org.springframework.util.StringUtils.hasText(search)) {
            spec = spec
                    .and(com.solemates.backend.repository.specification.ChallengeSpecification.titleContains(search));
        }

        if (org.springframework.util.StringUtils.hasText(status)) {
            try {
                ChallengeStatus challengeStatus = ChallengeStatus.valueOf(status.toUpperCase());
                spec = spec.and(com.solemates.backend.repository.specification.ChallengeSpecification
                        .hasStatus(challengeStatus));
            } catch (IllegalArgumentException e) {
                // Ignore invalid status
            }
        }

        org.springframework.data.domain.Page<Challenge> pageResult = challengeRepository.findAll(spec, pageable);

        List<ChallengeDTO> content = pageResult.getContent().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());

        return com.solemates.backend.dto.PageResponse.<ChallengeDTO>builder()
                .content(content)
                .pageNo(pageResult.getNumber())
                .pageSize(pageResult.getSize())
                .totalElements(pageResult.getTotalElements())
                .totalPages(pageResult.getTotalPages())
                .last(pageResult.isLast())
                .build();
    }

    @Override
    public ChallengeDTO updateChallenge(Long id, ChallengeDTO dto) {
        Challenge challenge = challengeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Challenge not found"));

        challenge.setTitle(dto.getTitle());
        challenge.setSubTitle(dto.getSubTitle());
        challenge.setDescription(dto.getDescription());
        challenge.setImageUrl(dto.getImageUrl());
        challenge.setStartDate(dto.getStartDate());
        challenge.setEndDate(dto.getEndDate());
        challenge.setGoal(dto.getGoal());
        challenge.setUnit(dto.getUnit());
        challenge.setDistances(dto.getDistances());
        challenge.setCompletionTime(dto.getCompletionTime());
        challenge.setRegistrationDeadline(dto.getRegistrationDeadline());
        challenge.setActivityTypes(dto.getActivityTypes());
        challenge.setBibUrl(dto.getBibUrl());
        challenge.setRules(dto.getRules());
        challenge.setStatus(determineStatus(dto.getStartDate(), dto.getEndDate()));

        // Update Options
        if (dto.getOptions() != null) {
            challenge.getOptions().clear(); // Remove old options
            List<ChallengeOption> newOptions = dto.getOptions().stream()
                    .map(optDto -> ChallengeOption.builder()
                            .name(optDto.getName())
                            .description(optDto.getDescription())
                            .price(optDto.getPrice())
                            .originalPrice(optDto.getOriginalPrice())
                            .challenge(challenge)
                            .build())
                    .collect(Collectors.toList());
            challenge.getOptions().addAll(newOptions);
        }

        Challenge updated = challengeRepository.save(challenge);
        return mapToDTO(updated);
    }

    private ChallengeStatus determineStatus(LocalDateTime startDate, LocalDateTime endDate) {
        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(startDate)) {
            return ChallengeStatus.UPCOMING;
        } else if (now.isAfter(endDate)) {
            return ChallengeStatus.ENDED;
        } else {
            return ChallengeStatus.ACTIVE;
        }
    }

    private ChallengeDTO mapToDTO(Challenge challenge) {
        return ChallengeDTO.builder()
                .id(challenge.getId())
                .title(challenge.getTitle())
                .subTitle(challenge.getSubTitle())
                .description(challenge.getDescription())
                .imageUrl(challenge.getImageUrl())
                .startDate(challenge.getStartDate())
                .endDate(challenge.getEndDate())
                .goal(challenge.getGoal())
                .unit(challenge.getUnit())
                .status(challenge.getStatus())
                .participantsCount(challenge.getParticipantsCount())
                .options(challenge.getOptions() != null ? challenge.getOptions().stream()
                        .map(opt -> ChallengeOptionDTO.builder()
                                .id(opt.getId())
                                .name(opt.getName())
                                .description(opt.getDescription())
                                .price(opt.getPrice())
                                .originalPrice(opt.getOriginalPrice())
                                .build())
                        .collect(Collectors.toList()) : null)
                .distances(challenge.getDistances())
                .completionTime(challenge.getCompletionTime())
                .registrationDeadline(challenge.getRegistrationDeadline())
                .activityTypes(challenge.getActivityTypes())
                .bibUrl(challenge.getBibUrl())
                .rules(challenge.getRules())
                .build();
    }
}
