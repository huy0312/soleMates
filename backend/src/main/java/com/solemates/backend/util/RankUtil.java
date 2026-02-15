package com.solemates.backend.util;

public class RankUtil {

    private static final int SILVER_THRESHOLD = 1000;
    private static final int GOLD_THRESHOLD = 3000;
    private static final int PLATINUM_THRESHOLD = 6000;

    public static String getRankName(int points) {
        if (points >= PLATINUM_THRESHOLD)
            return "Bạch Kim";
        if (points >= GOLD_THRESHOLD)
            return "Vàng";
        if (points >= SILVER_THRESHOLD)
            return "Bạc";
        return "Thành viên";
    }

    public static Integer getNextRankThreshold(int points) {
        if (points >= PLATINUM_THRESHOLD)
            return null; // No next rank
        if (points >= GOLD_THRESHOLD)
            return PLATINUM_THRESHOLD;
        if (points >= SILVER_THRESHOLD)
            return GOLD_THRESHOLD;
        return SILVER_THRESHOLD;
    }

    public static Double getRankProgress(int points) {
        if (points >= PLATINUM_THRESHOLD)
            return 100.0;

        int currentLevelStart = 0;
        int nextLevelStart = SILVER_THRESHOLD;

        if (points >= GOLD_THRESHOLD) {
            currentLevelStart = GOLD_THRESHOLD;
            nextLevelStart = PLATINUM_THRESHOLD;
        } else if (points >= SILVER_THRESHOLD) {
            currentLevelStart = SILVER_THRESHOLD;
            nextLevelStart = GOLD_THRESHOLD;
        }

        double progress = (double) (points - currentLevelStart) / (nextLevelStart - currentLevelStart) * 100;
        return Math.min(Math.max(progress, 0.0), 100.0);
    }
}
