package com.solemates.backend.service;

import com.solemates.backend.dto.ChallengeDTO;
import java.util.List;

public interface ChallengeService {
    ChallengeDTO createChallenge(ChallengeDTO challengeDTO);

    List<ChallengeDTO> getAllChallenges(boolean includeExpired);

    ChallengeDTO getChallengeById(Long id);

    ChallengeDTO updateChallenge(Long id, ChallengeDTO challengeDTO);

    com.solemates.backend.dto.PageResponse<ChallengeDTO> getChallenges(int page, int size, String search,
            String status);
}
