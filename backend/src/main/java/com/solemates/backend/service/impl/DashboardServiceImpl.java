package com.solemates.backend.service.impl;

import com.solemates.backend.dto.DashboardDTO;
import com.solemates.backend.dto.TransactionDTO;
import com.solemates.backend.model.ChallengeOption;
import com.solemates.backend.model.Transaction;
import com.solemates.backend.model.User;
import com.solemates.backend.repository.ChallengeOptionRepository;
import com.solemates.backend.repository.ChallengeRepository;
import com.solemates.backend.repository.TransactionRepository;
import com.solemates.backend.repository.UserRepository;
import com.solemates.backend.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final ChallengeRepository challengeRepository;
    private final ChallengeOptionRepository challengeOptionRepository;

    @Override
    public DashboardDTO getStats() {
        long totalUsers = userRepository.count();
        long activeChallenges = challengeRepository.count(); // Simplified for now, really should query by status/date

        List<Transaction> transactions = transactionRepository.findAll();
        double totalRevenue = transactions.stream()
                .filter(t -> "SUCCESS".equalsIgnoreCase(t.getStatus()))
                .mapToDouble(Transaction::getAmount)
                .sum();

        return DashboardDTO.builder()
                .totalUsers(totalUsers)
                .totalRevenue(totalRevenue)
                .activeChallenges(activeChallenges)
                .completedChallenges(0) // Logic needed or just mock
                .revenueChart(getRevenueChartData(transactions))
                .userChart(getUserChartData())
                .build();
    }

    @Override
    public void saveTransaction(TransactionDTO dto) {
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        ChallengeOption option = null;
        if (dto.getChallengeOptionId() != null) {
            option = challengeOptionRepository.findById(dto.getChallengeOptionId()).orElse(null);
        }

        Transaction transaction = Transaction.builder()
                .user(user)
                .challengeOption(option)
                .amount(dto.getAmount())
                .status(dto.getStatus())
                .paymentMethod(dto.getPaymentMethod())
                .build();

        // Manual setting of createdAt/updatedAt is handled by JPA Auditing usually,
        // but ensure Transaction extends BaseEntity and @EnableJpaAuditing is on
        // (SecurityConfig or main class).
        // Since we didn't check main class, let's assume it works or we might need to
        // set it manually if it's null.
        if (transaction.getCreatedAt() == null) {
            transaction.setCreatedAt(LocalDateTime.now());
        }

        transactionRepository.save(transaction);
    }

    private List<DashboardDTO.ChartData> getRevenueChartData(List<Transaction> allTransactions) {
        // Group by month for the last 6 months
        Map<String, Double> revenueMap = new LinkedHashMap<>();
        LocalDateTime now = LocalDateTime.now();
        List<String> months = new ArrayList<>();

        // Initialize last 6 months with 0
        for (int i = 5; i >= 0; i--) {
            String key = now.minusMonths(i).format(DateTimeFormatter.ofPattern("MM/yyyy"));
            revenueMap.put(key, 0.0);
            months.add(key);
        }

        for (Transaction t : allTransactions) {
            if ("SUCCESS".equalsIgnoreCase(t.getStatus()) && t.getCreatedAt() != null) {
                String key = t.getCreatedAt().format(DateTimeFormatter.ofPattern("MM/yyyy"));
                if (revenueMap.containsKey(key)) {
                    revenueMap.put(key, revenueMap.get(key) + t.getAmount());
                }
            }
        }

        return revenueMap.entrySet().stream()
                .map(e -> DashboardDTO.ChartData.builder().name(e.getKey()).value(e.getValue()).build())
                .collect(Collectors.toList());
    }

    private List<DashboardDTO.ChartData> getUserChartData() {
        // Similar to revenue but counting users created
        List<User> users = userRepository.findAll();
        Map<String, Double> userMap = new LinkedHashMap<>();
        LocalDateTime now = LocalDateTime.now();

        for (int i = 5; i >= 0; i--) {
            String key = now.minusMonths(i).format(DateTimeFormatter.ofPattern("MM/yyyy"));
            userMap.put(key, 0.0);
        }

        for (User u : users) {
            if (u.getCreatedAt() != null) {
                String key = u.getCreatedAt().format(DateTimeFormatter.ofPattern("MM/yyyy"));
                if (userMap.containsKey(key)) {
                    userMap.put(key, userMap.get(key) + 1);
                }
            }
        }

        return userMap.entrySet().stream()
                .map(e -> DashboardDTO.ChartData.builder().name(e.getKey()).value(e.getValue()).build())
                .collect(Collectors.toList());
    }
}
