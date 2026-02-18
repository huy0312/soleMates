package com.solemates.backend.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class DashboardDTO {
    private long totalUsers;
    private double totalRevenue;
    private long activeChallenges;
    private long completedChallenges;

    // For charts
    private List<ChartData> revenueChart;
    private List<ChartData> userChart;

    @Data
    @Builder
    public static class ChartData {
        private String name; // Month/Day label
        private double value;
    }
}
