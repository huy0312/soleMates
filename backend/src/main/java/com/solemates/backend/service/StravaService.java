package com.solemates.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.solemates.backend.config.StravaConfig;
import com.solemates.backend.model.User;
import com.solemates.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class StravaService {

    private final UserRepository userRepository;
    private final StravaConfig stravaConfig;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public void exchangeToken(String code) {
        String tokenUrl = "https://www.strava.com/oauth/token";

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("client_id", stravaConfig.getClientId());
        body.add("client_secret", stravaConfig.getClientSecret());
        body.add("code", code);
        body.add("grant_type", "authorization_code");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(tokenUrl, request, String.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());

                String accessToken = root.path("access_token").asText();
                String refreshToken = root.path("refresh_token").asText();
                long expiresAt = root.path("expires_at").asLong();

                JsonNode athlete = root.path("athlete");
                Long stravaId = athlete.path("id").asLong();
                String profileUrl = athlete.path("profile").asText();

                // Get current user
                String email = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal())
                        .getUsername();
                User user = userRepository.findByEmail(email)
                        .orElseThrow(() -> new RuntimeException("User not found"));

                user.setStravaId(stravaId);
                user.setStravaAccessToken(accessToken);
                user.setStravaRefreshToken(refreshToken);
                user.setStravaTokenExpiresAt(expiresAt);
                user.setStravaProfileUrl(profileUrl);

                userRepository.save(user);
            } else {
                throw new RuntimeException("Failed to exchange token with Strava");
            }
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Error connecting to Strava: " + e.getMessage());
        }
    }

    public void disconnect() {
        String email = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal())
                .getUsername();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setStravaId(null);
        user.setStravaAccessToken(null);
        user.setStravaRefreshToken(null);
        user.setStravaTokenExpiresAt(null);
        user.setStravaProfileUrl(null);

        userRepository.save(user);
    }

    public Map<String, Object> getConnectionStatus() {
        String email = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal())
                .getUsername();
        User user = userRepository.findByEmail(email).orElse(null);

        Map<String, Object> status = new java.util.HashMap<>();
        if (user != null && user.getStravaAccessToken() != null) {
            status.put("connected", true);
            status.put("stravaId", user.getStravaId());
            status.put("profileUrl", user.getStravaProfileUrl());
        } else {
            status.put("connected", false);
        }
        return status;
    }

    public boolean isConnected() {
        return (boolean) getConnectionStatus().get("connected");
    }

    public String getClientId() {
        return stravaConfig.getClientId();
    }

    private void refreshTokenIfNeeded(User user) {
        if (user.getStravaTokenExpiresAt() == null || user.getStravaRefreshToken() == null) {
            return;
        }

        // Check if token expires in the next 5 minutes (300 seconds)
        long currentTime = java.time.Instant.now().getEpochSecond();
        if (currentTime + 300 > user.getStravaTokenExpiresAt()) {
            String tokenUrl = "https://www.strava.com/oauth/token";

            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("client_id", stravaConfig.getClientId());
            body.add("client_secret", stravaConfig.getClientSecret());
            body.add("grant_type", "refresh_token");
            body.add("refresh_token", user.getStravaRefreshToken());

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);

            try {
                ResponseEntity<String> response = restTemplate.postForEntity(tokenUrl, request, String.class);
                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    JsonNode root = objectMapper.readTree(response.getBody());

                    String newAccessToken = root.path("access_token").asText();
                    String newRefreshToken = root.path("refresh_token").asText();
                    long newExpiresAt = root.path("expires_at").asLong();

                    user.setStravaAccessToken(newAccessToken);
                    user.setStravaRefreshToken(newRefreshToken);
                    user.setStravaTokenExpiresAt(newExpiresAt);

                    userRepository.save(user);
                } else {
                    throw new RuntimeException("Failed to refresh Strava token");
                }
            } catch (Exception e) {
                e.printStackTrace();
                // If refresh fails, disconnect the user to force re-authentication
                System.err.println("Strava token refresh failed for user " + user.getEmail() + ". Disconnecting.");
                user.setStravaId(null);
                user.setStravaAccessToken(null);
                user.setStravaRefreshToken(null);
                user.setStravaTokenExpiresAt(null);
                user.setStravaProfileUrl(null);
                userRepository.save(user);
                throw new RuntimeException("Error refreshing Strava token: " + e.getMessage());
            }
        }
    }

    public JsonNode getAthleteStats() {
        String email = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal())
                .getUsername();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getStravaAccessToken() == null) {
            throw new RuntimeException("User is not connected to Strava");
        }

        refreshTokenIfNeeded(user);

        String statsUrl = "https://www.strava.com/api/v3/athletes/" + user.getStravaId() + "/stats";
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(user.getStravaAccessToken());
        HttpEntity<?> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(statsUrl, org.springframework.http.HttpMethod.GET,
                    entity, String.class);
            return objectMapper.readTree(response.getBody());
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch Strava stats: " + e.getMessage());
        }
    }

    public List<Map<String, Object>> getAthleteActivities(Integer year, int page) {
        String email = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal())
                .getUsername();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getStravaAccessToken() == null) {
            return java.util.Collections.emptyList();
        }

        refreshTokenIfNeeded(user);

        // Build query params
        StringBuilder urlBuilder = new StringBuilder("https://www.strava.com/api/v3/athlete/activities?");
        urlBuilder.append("page=").append(page);
        urlBuilder.append("&per_page=10"); // Pagination limit

        if (year != null) {
            LocalDateTime startOfYear = LocalDateTime.of(year, 1, 1, 0, 0);
            LocalDateTime endOfYear = LocalDateTime.of(year + 1, 1, 1, 0, 0);
            long after = startOfYear.toEpochSecond(ZoneOffset.UTC);
            long before = endOfYear.toEpochSecond(ZoneOffset.UTC);
            urlBuilder.append("&after=").append(after);
            urlBuilder.append("&before=").append(before);
        }

        String activitiesUrl = urlBuilder.toString();
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(user.getStravaAccessToken());
        HttpEntity<?> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<List> response = restTemplate.exchange(activitiesUrl,
                    org.springframework.http.HttpMethod.GET, entity, List.class);
            return response.getBody();
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch Strava activities: " + e.getMessage());
        }
    }

    public JsonNode getActivity(Long id) {
        String email = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal())
                .getUsername();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getStravaAccessToken() == null) {
            throw new RuntimeException("User is not connected to Strava");
        }

        refreshTokenIfNeeded(user);

        String activityUrl = "https://www.strava.com/api/v3/activities/" + id;
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(user.getStravaAccessToken());
        HttpEntity<?> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(activityUrl,
                    org.springframework.http.HttpMethod.GET,
                    entity, String.class);
            return objectMapper.readTree(response.getBody());
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch Strava activity details: " + e.getMessage());
        }
    }
}
