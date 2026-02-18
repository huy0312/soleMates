package com.solemates.backend.controller;

import com.solemates.backend.dto.DashboardDTO;
import com.solemates.backend.dto.TransactionDTO;
import com.solemates.backend.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    public ResponseEntity<DashboardDTO> getDashboardStats() {
        return ResponseEntity.ok(dashboardService.getStats());
    }

    @PostMapping("/transaction")
    public ResponseEntity<Void> saveTransaction(@RequestBody TransactionDTO dto) {
        dashboardService.saveTransaction(dto);
        return ResponseEntity.ok().build();
    }
}
