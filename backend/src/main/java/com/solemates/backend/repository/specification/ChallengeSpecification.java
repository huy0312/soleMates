package com.solemates.backend.repository.specification;

import com.solemates.backend.enums.ChallengeStatus;
import com.solemates.backend.model.Challenge;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

public class ChallengeSpecification {

    public static Specification<Challenge> hasStatus(ChallengeStatus status) {
        return (root, query, criteriaBuilder) -> {
            if (status == null) {
                return criteriaBuilder.conjunction();
            }

            java.time.LocalDateTime now = java.time.LocalDateTime.now();

            switch (status) {
                case UPCOMING:
                    // Start date > now
                    return criteriaBuilder.greaterThan(root.get("startDate"), now);
                case ENDED:
                    // End date < now
                    return criteriaBuilder.lessThan(root.get("endDate"), now);
                case ACTIVE:
                    // Start date <= now AND End date >= now
                    return criteriaBuilder.and(
                            criteriaBuilder.lessThanOrEqualTo(root.get("startDate"), now),
                            criteriaBuilder.greaterThanOrEqualTo(root.get("endDate"), now));
                default:
                    return criteriaBuilder.conjunction();
            }
        };
    }

    public static Specification<Challenge> titleContains(String title) {
        return (root, query, criteriaBuilder) -> {
            if (!StringUtils.hasText(title)) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.like(criteriaBuilder.lower(root.get("title")), "%" + title.toLowerCase() + "%");
        };
    }
}
