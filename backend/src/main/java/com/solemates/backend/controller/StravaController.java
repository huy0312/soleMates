package com.solemates.backend.controller;

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
}
