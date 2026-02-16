package com.solemates.backend.controller;

import com.solemates.backend.service.GeminiService;
import com.solemates.backend.service.StravaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/strava")
@RequiredArgsConstructor
public class StravaController {

    private final StravaService stravaService;
    private final GeminiService geminiService;

    @PostMapping("/connect")
    public ResponseEntity<?> connectStrava(@RequestBody Map<String, String> payload) {
        String code = payload.get("code");
        if (code == null) {
            return ResponseEntity.badRequest().body("Authorization code is missing");
        }
        stravaService.exchangeToken(code);
        return ResponseEntity.ok("Strava connected successfully");
    }

    @PostMapping("/disconnect")
    public ResponseEntity<?> disconnectStrava() {
        stravaService.disconnect();
        return ResponseEntity.ok("Strava disconnected successfully");
    }

    @GetMapping("/config")
    public ResponseEntity<?> getConfig() {
        return ResponseEntity.ok(Map.of("clientId", stravaService.getClientId()));
    }

    @GetMapping("/status")
    public ResponseEntity<?> getStatus() {
        return ResponseEntity.ok(stravaService.getConnectionStatus());
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        return ResponseEntity.ok(stravaService.getAthleteStats());
    }

    @GetMapping("/activities")
    public ResponseEntity<?> getActivities(
            @RequestParam(required = false) Integer year,
            @RequestParam(defaultValue = "1") int page) {
        return ResponseEntity.ok(stravaService.getAthleteActivities(year, page));
    }

    @GetMapping("/activities/{id}")
    public ResponseEntity<?> getActivity(@PathVariable Long id) {
        return ResponseEntity.ok(stravaService.getActivity(id));
    }

    @PostMapping("/activities/{id}/analyze")
    public ResponseEntity<?> analyzeActivity(@PathVariable Long id) {
        try {
            Map<String, Object> activityData = stravaService.getActivity(id);
            String analysis = geminiService.analyzeActivity(activityData);
            return ResponseEntity.ok(Map.of("analysis", analysis));
        } catch (Exception e) {
            String msg = e.getMessage() != null ? e.getMessage() : "Unknown error";
            if (msg.contains("429") || msg.toLowerCase().contains("too many") || msg.toLowerCase().contains("rate")) {
                return ResponseEntity.status(429)
                        .body(Map.of("error", "API đang bị giới hạn tần suất. Vui lòng thử lại sau vài giây."));
            }
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Không thể phân tích: " + msg));
        }
    }

}
