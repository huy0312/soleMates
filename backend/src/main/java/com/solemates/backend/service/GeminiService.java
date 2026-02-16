package com.solemates.backend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class GeminiService {

    @Value("${gemini.api-key:}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @SuppressWarnings("unchecked")
    public String analyzeActivity(Map<String, Object> activityData) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new RuntimeException("Gemini API key is not configured");
        }

        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key="
                + apiKey;

        // Build the prompt
        String prompt = buildPrompt(activityData);

        // Build the request body as JSON string to avoid serialization issues
        String requestJson;
        try {
            Map<String, Object> requestBody = Map.of(
                    "contents", List.of(
                            Map.of("parts", List.of(
                                    Map.of("text", prompt)))),
                    "generationConfig", Map.of(
                            "temperature", 0.7,
                            "maxOutputTokens", 4096));
            requestJson = objectMapper.writeValueAsString(requestBody);
        } catch (Exception e) {
            throw new RuntimeException("Failed to build request: " + e.getMessage());
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<String> request = new HttpEntity<>(requestJson, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> responseMap = objectMapper.readValue(response.getBody(),
                        new TypeReference<Map<String, Object>>() {
                        });

                // Extract text from Gemini response
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) responseMap.get("candidates");
                if (candidates != null && !candidates.isEmpty()) {
                    Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
                    List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
                    if (parts != null && !parts.isEmpty()) {
                        return (String) parts.get(0).get("text");
                    }
                }
                return "Không thể phân tích dữ liệu hoạt động.";
            } else {
                throw new RuntimeException("Gemini API returned status: " + response.getStatusCode());
            }
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            throw new RuntimeException("Gemini API error: " + e.getStatusCode() + " - " + e.getResponseBodyAsString());
        } catch (Exception e) {
            throw new RuntimeException("Error calling Gemini API: " + e.getMessage());
        }
    }

    private String buildPrompt(Map<String, Object> data) {
        double distanceKm = 0;
        int movingTimeSec = 0;
        double avgSpeed = 0;
        double maxSpeed = 0;
        double elevationGain = 0;
        Object avgHr = null;
        Object maxHr = null;
        String name = "";
        String type = "";

        try {
            distanceKm = ((Number) data.getOrDefault("distance", 0)).doubleValue() / 1000.0;
        } catch (Exception ignored) {
        }
        try {
            movingTimeSec = ((Number) data.getOrDefault("moving_time", 0)).intValue();
        } catch (Exception ignored) {
        }
        try {
            avgSpeed = ((Number) data.getOrDefault("average_speed", 0)).doubleValue();
        } catch (Exception ignored) {
        }
        try {
            maxSpeed = ((Number) data.getOrDefault("max_speed", 0)).doubleValue();
        } catch (Exception ignored) {
        }
        try {
            elevationGain = ((Number) data.getOrDefault("total_elevation_gain", 0)).doubleValue();
        } catch (Exception ignored) {
        }
        try {
            avgHr = data.get("average_heartrate");
        } catch (Exception ignored) {
        }
        try {
            maxHr = data.get("max_heartrate");
        } catch (Exception ignored) {
        }
        try {
            name = (String) data.getOrDefault("name", "");
        } catch (Exception ignored) {
        }
        try {
            type = (String) data.getOrDefault("type", "Run");
        } catch (Exception ignored) {
        }

        int minutes = movingTimeSec / 60;
        int seconds = movingTimeSec % 60;

        double paceMinPerKm = 0;
        if (avgSpeed > 0) {
            paceMinPerKm = 16.6667 / avgSpeed;
        }

        StringBuilder sb = new StringBuilder();
        sb.append("Bạn là một huấn luyện viên chạy bộ chuyên nghiệp với hơn 15 năm kinh nghiệm. ");
        sb.append("Hãy phân tích CHI TIẾT và ĐẦY ĐỦ hoạt động chạy bộ sau bằng tiếng Việt. ");
        sb.append("Phân tích phải thật sâu sắc, cụ thể, có số liệu minh họa. Viết ít nhất 500 từ.\n\n");
        sb.append("== THÔNG TIN HOẠT ĐỘNG ==\n");
        sb.append("Tên: ").append(name).append("\n");
        sb.append("Loại: ").append(type).append("\n");
        sb.append("Quãng đường: ").append(String.format("%.2f", distanceKm)).append(" km\n");
        sb.append("Thời gian: ").append(minutes).append(" phút ").append(seconds).append(" giây\n");
        sb.append("Tốc độ trung bình: ").append(String.format("%.2f", avgSpeed)).append(" m/s (Pace: ")
                .append(String.format("%.2f", paceMinPerKm)).append(" phút/km)\n");
        sb.append("Tốc độ tối đa: ").append(String.format("%.2f", maxSpeed)).append(" m/s\n");
        sb.append("Độ cao đạt được: ").append(String.format("%.0f", elevationGain)).append(" m\n");
        if (avgHr != null)
            sb.append("Nhịp tim trung bình: ").append(avgHr).append(" bpm\n");
        if (maxHr != null)
            sb.append("Nhịp tim tối đa: ").append(maxHr).append(" bpm\n");

        sb.append("\n== YÊU CẦU PHÂN TÍCH CHI TIẾT ==\n");
        sb.append("Hãy phân tích đầy đủ theo các mục sau, mỗi mục viết chi tiết 3-5 câu:\n\n");
        sb.append(
                "1. 📊 **ĐÁNH GIÁ TỔNG QUAN**: Nhận xét tổng thể về buổi chạy, so sánh với tiêu chuẩn runner phổ thông.\n");
        sb.append(
                "2. 🏃 **PHÂN TÍCH TỐC ĐỘ & PACE**: Đánh giá pace trung bình, so sánh với các mức (dễ/trung bình/nhanh), phân tích sự chênh lệch giữa tốc độ TB và tốc độ tối đa.\n");
        sb.append(
                "3. ❤️ **PHÂN TÍCH NHỊP TIM**: Đánh giá vùng nhịp tim (Zone), cường độ tập luyện, mức độ phù hợp. Nếu không có dữ liệu nhịp tim, gợi ý nên sử dụng đồng hồ đo nhịp tim.\n");
        sb.append("4. ⛰️ **PHÂN TÍCH ĐỊA HÌNH**: Nhận xét về độ cao tích lũy, ảnh hưởng đến hiệu suất.\n");
        sb.append("5. 💪 **ĐIỂM MẠNH**: Liệt kê ít nhất 3 điểm mạnh nổi bật của buổi tập.\n");
        sb.append("6. ⚠️ **ĐIỂM CẦN CẢI THIỆN**: Chỉ ra ít nhất 3 điểm cần cải thiện cụ thể.\n");
        sb.append(
                "7. 📋 **KẾ HOẠCH LUYỆN TẬP**: Gợi ý kế hoạch cho 3 buổi tập tiếp theo (loại bài tập, quãng đường, pace mục tiêu).\n");
        sb.append("8. 🎯 **MỤC TIÊU NGẮN HẠN**: Đề xuất mục tiêu cải thiện trong 2-4 tuần tới.\n");

        return sb.toString();
    }
}
